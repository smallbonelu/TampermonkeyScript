// ==UserScript==
// @name         OCV review case tool
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  shortcut for review case
// @author       Bruce Lu
// @include      https://ocv.microsoft.com/*
// @require      https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/6.18.2/babel.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/babel-polyfill/6.16.0/polyfill.js
// @require      https://ajax.aspnetcdn.com/ajax/jQuery/jquery-3.4.1.min.js
// @require      https://raw.githubusercontent.com/uzairfarooq/arrive/master/minified/arrive.min.js
// @grant        none
// ==/UserScript==


var inline_src = (<><![CDATA[

// Bug1, the first review shortcut review save button not working

 "use strict";
var reivewNotesTime = "6";
var reviewNotesSectionSelector =
  "body > div:nth-child(49) > div > div.view-port > div > div.triage.container-fluid > div > div.item-detail-pane.col-xs-8 > div > item-details > div > div > div > div:nth-child(3) > div.clean-tabs > span:nth-child(5) > a";
var reviewNotesSaveBtnSelector =
  "body > div:nth-child(49) > div > div.view-port > div > div.triage.container-fluid > div > div.item-detail-pane.col-xs-8 > div > item-details > div > div > div > div:nth-child(3) > div.tab-content > div > div.review-notes-section > button";
var myFeedbackLinkSelector =
  "body > div:nth-child(49) > div > div:nth-child(1) > div > div > table > tbody > tr > td:nth-child(3) > div > span:nth-child(2) > ul > li:nth-child(3) > a";
var notesTextAreaSelector =
  "body > div:nth-child(49) > div > div.view-port > div > div.triage.container-fluid > div > div.item-detail-pane.col-xs-8 > div > item-details > div > div > div > div:nth-child(3) > div.tab-content > div > div:nth-child(1) > textarea";
var reviewNotesSaveBtn;
var reviewNotesSection;
var MIN = 5;
var MAX = 6;

function formateDate() {
  var date = new Date();
  var year = date.getFullYear();
  var month = date.getMonth();
  var day = date.getDate();
  return `${year}/${month + 1}/${day}`;
}

function getAlias() {
  var myFeedbackLink = document.querySelector(myFeedbackLinkSelector);
  var str = decodeURI(myFeedbackLink.href);
  var alias = str.match(/([\w-]+)@[a-zA-Z_]+?\.[a-zA-Z]{2,3}/)[1];
  return alias;
}

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min; //含最大值，含最小值 
}

function reviewCase() {
  return new Promise(resolve => {
    reviewNotesSection && reviewNotesSection.click();
    resolve();
  });
}

// Waiting for reivew notes section element loaded
$(document).arrive(reviewNotesSectionSelector, function() {
  console.log("init the ocv review notes auto fill tool...")
  init();
});

function init() {
  var alias = getAlias();
  var date = formateDate();
  // Get the elements
  var triagingSuggestionsList = document
    .querySelector("div.header-bar > span")
    .textContent.split(":");
  var issuesText = triagingSuggestionsList[triagingSuggestionsList.length - 1];

  reviewNotesSection = document.querySelector(reviewNotesSectionSelector);
  reviewNotesSaveBtn = document.querySelector(reviewNotesSaveBtnSelector)
  console.log("reviewNotesSection", reviewNotesSection);


  reviewNotesSection.onclick = function(e) {
    e.stopPropagation();
    reivewNotesTime = getRandomIntInclusive(MIN, MAX)
    // Waiting for the review notes save button element loaded
    $(document).arrive(reviewNotesSaveBtnSelector, function() {
      reviewNotesSaveBtn = $(this);
      var notesTextArea = document.querySelector(notesTextAreaSelector);

      console.log("notestextArea", notesTextArea);

      // Fill the reivew notes

      if (notesTextArea.value === "") {
        var reviewNotes = `${date}, ${alias}, ${reivewNotesTime}:\n${alias}, ${issuesText}`;
        notesTextArea.value = reviewNotes;
        notesTextArea.dispatchEvent(new Event("change"));
      }
    });
  };

  // When press review shortcut key 'r', click the reivew notes section
  document.onkeyup = function(e) {
    if (e.keyCode === 82) {
      reviewCase().then(() => {
        console.log("reivewNotesSaveBtn", reviewNotesSaveBtn);
        console.log("review and save notes...")
        reviewNotesSaveBtn && reviewNotesSaveBtn[0].click();
      });
    }
  };
}




]]></>).toString();
var c = Babel.transform(inline_src, { presets: [ "es2015", "es2016" ] });
eval(c.code);