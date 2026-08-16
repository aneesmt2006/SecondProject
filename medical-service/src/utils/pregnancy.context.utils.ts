

export const buildRagContext=(chunks:Array<{text:string,source:string,chunkIndex:number}>):string=>{
    return chunks.map((chunk,index)=>`[Source ${index+1}:${chunk.source} , chunk ${chunk.chunkIndex}\n${chunk.text}]`).join("\n\n")
}