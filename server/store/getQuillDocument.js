/*
 * Copyright (c) Jon Lachlan 2020
*/
export default async function () {
    const { quillDocumentInMemory } = 
        await import('./quillDocumentInMemory.js');
    return quillDocumentInMemory;
}