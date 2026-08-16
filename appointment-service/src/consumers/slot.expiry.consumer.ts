import { createClient } from "redis";
import { config } from "../config/env.config.js";
import { container } from "../config/inversify.config.js";
import { TYPES } from "../types/type.js";
import type { IAppointentRepository } from "../repositories/interfaces/IAppointmentRepository.js";
import logger from "../utils/logger.js";

// Redis keyspace notification channel for expired keys
// Pattern: __keyevent@<db>__:expired
const EXPIRED_CHANNEL = "__keyevent@0__:expired";

// Slot key prefix — must match redisKeyGenerator: "slot:<doctorId>:<date>:<time>"
const SLOT_KEY_PREFIX = "slot:";

/**
 * Parses an expired Redis slot key back into its components.
 * Key format: slot:<doctorId>:<date>:<time>
 * e.g.  slot:doc123:07/26/2026: 3:30 PM
 */
const parseSlotKey = (key: string): { doctorId: string; date: string; time: string } | null => {
    if (!key.startsWith(SLOT_KEY_PREFIX)) return null;

    const withoutPrefix = key.slice(SLOT_KEY_PREFIX.length);
    const parts = withoutPrefix.split(":");

    if (parts.length < 3) return null;

    const doctorId = parts[0] as string;
    const date = parts[1] as string;
    const time = parts.slice(2).join(":");

    return { doctorId, date, time };
};

export const startSlotExpiryConsumer = async (): Promise<void> => {
    try {
        const subscriberClient = createClient({ url: config.redisUrl as string });

        subscriberClient.on("error", (err) => {
            logger.error("Slot Expiry Subscriber Redis error", { error: err.message });
        });

        await subscriberClient.connect();
        await subscriberClient.sendCommand(["CONFIG", "SET", "notify-keyspace-events", "Ex"]);

        logger.info("Slot Expiry Consumer listening for Redis key expirations");

        await subscriberClient.subscribe(EXPIRED_CHANNEL, async (expiredKey: string) => {
            if (!expiredKey.startsWith(SLOT_KEY_PREFIX)) return;

            const parsed = parseSlotKey(expiredKey);
            if (!parsed) {
                logger.warn(`Could not parse expired slot key`, { expiredKey });
                return;
            }

            const { doctorId, date, time } = parsed;
            logger.info(`Slot lock expired`, { doctorId, date, time });

            try {
                const appointmentRepo = container.get<IAppointentRepository>(TYPES.AppointmentRepository);
                const pendingAppointment = await appointmentRepo.findPendingBySlot(doctorId, date, time);

                if (!pendingAppointment) {
                    logger.info(`No PENDING appointment found for expired slot. Already processed.`, { doctorId, date, time });
                    return;
                }

                const appointmentId = pendingAppointment._id as string;
                await appointmentRepo.update(appointmentId, "EXPIRED");

                logger.info(`Appointment marked as EXPIRED. Slot is now available.`, { appointmentId });
            } catch (error: any) {
                logger.error(`Error processing expired slot key`, { expiredKey, error: error.message });
            }
        });
    } catch (error: any) {
        logger.error("Failed to start Slot Expiry Consumer", { error: error.message });
    }
};
