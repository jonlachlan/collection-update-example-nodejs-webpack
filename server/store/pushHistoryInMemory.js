/*
 * Copyright (c) Jon Lachlan 2020
*/ 

export const pushHistory = [];

export function push (update) {
    pushHistory.unshift(update);
}