import type { IDaySchedule } from "./interface.utils.js"

export const generateAvailableSlots = (daySchedule:IDaySchedule,duration:string,selectedDate:Date) =>{
    if(!daySchedule.enabled) return []

    const {start,end,breaks} = daySchedule

    const slots :{time:string,status:string}[] = [] 

    const convertToDate = (date:Date,timeStr:string)=>{
         const [time,modifier] = timeStr.split(" ")
         let [hours,minutes] = time!.split(":").map(Number)

         if (modifier === "PM" && hours !== 12) hours! += 12;
         if (modifier === "AM" && hours === 12) hours = 0;

        const newDate = new Date(date);
        newDate.setHours(hours!, minutes, 0, 0);
        return newDate;
    }

    const startDate = convertToDate(selectedDate,start!)
    const endDate = convertToDate(selectedDate,end!)


    const now = new Date()

    const isInbreak=(slot:Date)=>
        breaks?.filter(br => br && br.start && br.end).some((br)=>{
            let brStart = convertToDate(selectedDate,br.start)
            let brEnd = convertToDate(selectedDate,br.end)
            return slot >= brStart && slot <= brEnd
        })
    


    for(let time=startDate ;time < endDate ; time = new Date(time.getTime() + Number(duration) * 60*1000)){
            if(!isInbreak(time)){
                const formatted = time.toLocaleDateString("en-US",{
                    hour:'numeric',
                    minute:'2-digit',
                    hour12:true
                })

                // Default status is 'available', 'past' if in past. 
                // We will update 'booked' status in the service layer.
                const status = selectedDate.toDateString() === now.toDateString() && time < now ? "past" :"available"

                slots.push({time:formatted,status})
            }

            
    }

    return slots

}
