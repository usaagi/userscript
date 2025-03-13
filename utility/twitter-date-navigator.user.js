// ==UserScript==
// @name         Twitter Date Navigator
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Navigate to tweets from x days before or after the current tweet
// @author       You
// @match        https://twitter.com/*/status/*
// @grant        none
// ==/UserScript==

'use strict';

console.log('Twitter Date Navigator')

// Get the username and tweet ID from the URL
const urlParts = window.location.pathname.split('/');
const username = urlParts[1];
const tweetId = urlParts[3];

// Convert the tweet ID to a date
const tweetDate = new Date((tweetId >> 22) + 1288834974657);

console.log(tweetDate)


// Create the select box
const selectBox = document.createElement('select');
const options = ['1 day', '1 week', '1 month'];
for (const option of options) {
    const optionElement = document.createElement('option');
    optionElement.text = option;
    selectBox.add(optionElement);
}

// Create the button
const button = document.createElement('button');
button.textContent = 'Go to tweets';

// Add event listener to the button
button.addEventListener('click', () => {
    const selectedOption = selectBox.options[selectBox.selectedIndex].text;
    const [value, unit] = selectedOption.split(' ');

    let sinceDate, untilDate;
    if (unit === 'day') {
        sinceDate = new Date(tweetDate.getTime() - value * 24 * 60 * 60 * 1000);
        untilDate = new Date(tweetDate.getTime() + value * 24 * 60 * 60 * 1000);
    } else if (unit === 'week') {
        sinceDate = new Date(tweetDate.getTime() - value * 7 * 24 * 60 * 60 * 1000);
        untilDate = new Date(tweetDate.getTime() + value * 7 * 24 * 60 * 60 * 1000);
    } else if (unit === 'month') {
        sinceDate = new Date(tweetDate.getFullYear(), tweetDate.getMonth() - value, tweetDate.getDate());
        untilDate = new Date(tweetDate.getFullYear(), tweetDate.getMonth() + value, tweetDate.getDate());
    }

    const url = `https://twitter.com/search?q=from:@${username}%20since:${sinceDate.toISOString()}%20until:${untilDate.toISOString()}`;
    window.location.href = url;
});

// Add the select box and button to the page
document.body.appendChild(selectBox);
document.body.appendChild(button);

