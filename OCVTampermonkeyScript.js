// ==UserScript==
// @name         OCV review case tool
// @namespace    http://tampermonkey.net/
// @version      0.2
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


"use strict";

let notesAndTransSelector =
  "body > div:nth-child(49) > div > div.view-port > div > div.triage.container-fluid > div > div.item-detail-pane.col-xs-8 > div > item-details > div > div > div > div:nth-child(3) > div.clean-tabs > span:nth-child(1)";
let reviewNotesSectionSelector =
  "body > div:nth-child(49) > div > div.view-port > div > div.triage.container-fluid > div > div.item-detail-pane.col-xs-8 > div > item-details > div > div > div > div:nth-child(3) > div.clean-tabs > span:nth-child(5) > a";
let reviewNotesSaveBtnSelector =
  "body > div:nth-child(49) > div > div.view-port > div > div.triage.container-fluid > div > div.item-detail-pane.col-xs-8 > div > item-details > div > div > div > div:nth-child(3) > div.tab-content > div > div.review-notes-section > button";
let myFeedbackLinkSelector =
  "body > div:nth-child(49) > div > div:nth-child(1) > div > div > table > tbody > tr > td:nth-child(3) > div > span:nth-child(2) > ul > li:nth-child(3) > a";
let notesTextAreaSelector =
  "body > div:nth-child(49) > div > div.view-port > div > div.triage.container-fluid > div > div.item-detail-pane.col-xs-8 > div > item-details > div > div > div > div:nth-child(3) > div.tab-content > div > div:nth-child(1) > textarea";
let userNameSelector =
  "body > div:nth-child(49) > div > div:nth-child(1) > div > div > table > tbody > tr > td:nth-child(3) > div > span:nth-child(2) > a > span.navbar-current-user";
let issuesListSelector = 
  "body > div:nth-child(49) > div > div.view-port > div > div.triage.container-fluid > div > div.item-detail-pane.col-xs-8 > div > item-details > div > div > div > div.item-details-key-details > div.fields-column > table > tbody > tr:nth-child(2) > td.field-value > tag-list-with-states > div > span > a:nth-child(1)"
let savingCircleSelector =
  "body > div:nth-child(49) > div > div.view-port > div > div.triage.container-fluid > div > div.item-detail-pane.col-xs-8 > div > item-details > div > div > div > div:nth-child(3) > div.tab-content > div > div.review-notes-section > div.review-notes-saving-spinner";
let updateTimeStampSelector =
  "body > div:nth-child(49) > div > div.view-port > div > div.triage.container-fluid > div > div.item-detail-pane.col-xs-8 > div > item-details > div > div > div > div:nth-child(3) > div.tab-content > div > div:nth-child(2)";

let MIN = 5;
let MAX = 6;
let isShortcut = false;
let issuesStatusList;
let reviewNotesSection;

function formateDate(splitor) {
  splitor = splitor || "/";
  let date = new Date();
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();
  return `${year}${splitor}${month < 10 ? "0" + month : month}${splitor}${
    day < 10 ? "0" + day : day
  }`;
}

function getAlias() {
  let myFeedbackLink = document.querySelector(myFeedbackLinkSelector);
  let str = decodeURI(myFeedbackLink.href);
  let alias = str.match(/([\w-]+)@[a-zA-Z_]+?\.[a-zA-Z]{2,3}/)[1];
  return alias;
}

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min; //inlcude maximum and minimum value
}

function getIssuesStatus() {
  let issuesListLink = document.querySelectorAll(issuesListSelector);
  if (issuesListLink.length == 0) return;
  let issuesStatusList = [];
  issuesListLink.forEach((issue) => {
    let issueText = issue.text.trim() || "";
    let status = issue.title.trim() || "";
    issuesStatusList.push({
      "issue": issueText,
      "status": status
    })
  })
  return issuesStatusList;
}



function addNotes(node) {
  return new Promise((resolve, reject) => {
    let alias = getAlias();
    let date = formateDate();
    let reivewNotesTime = getRandomIntInclusive(MIN, MAX);
    // Get the elements
    let triagingSuggestionsList = document
      .querySelector("div.header-bar > span")
      .textContent.split(":");
    let issuesText =
      triagingSuggestionsList[triagingSuggestionsList.length - 1];
    // Fill the reivew notes
    if (node.value === "") {
      let reviewNotes = `${date}, ${alias}, ${reivewNotesTime}:\n${alias}, ${issuesText}`;
      node.value = reviewNotes;
      node.dispatchEvent(new Event("change"));
      resolve();
    } else {
      reject();
    }
  });
}


// Add util tool element in the page
function addUtilTool() {
  $(document).arrive(userNameSelector, { onceOnly: true }, function() {
    console.log("Add util tool to the page");
    let userNameEle = $(this)[0];
    userNameEle.onclick = function(e) {
      e.stopPropagation();
    };
    let myDailReviewedURL = `https://ocv.microsoft.com/#/discover/?searchtype=OcvItems&relDateType=all&offset=0&q=(Product:"SharePoint" OR Product:"OneDrive for Business" OR Product:"Outlook" OR Product:"Azure AD") AND (OcvAreas:(SetDate:${formateDate(
      "-"
    )} AND (SetBy:"${getAlias()}")))&allAreas`;
    let ultilHTML = `<div id='util-container' style="position: fixed; top: 90px; right: 20px; overflow: hidden; z-index: 9999">
                    <div class="daily-reviewed">
                      <a href=${encodeURI(
                        myDailReviewedURL
                      )} target='_blank' style="background-color: #005A9E; color: white; display: inline-block;">DailyReviewed</a>
                    </div>
                  </div>`;
    userNameEle.insertAdjacentHTML("beforeend", ultilHTML);
  });
}

function reviewCase(e) {
    if (e.keyCode === 82) {
      // TODO: if triagging issues has been reviewed, function returned to avoid repeat reiview action.
      let issuesStatus = getIssuesStatus();
      let currentTriaggingIssue = issuesStatus[issuesStatus.length - 1]
      if (currentTriaggingIssue.status.indexOf("Not Reviewed") === -1) {
        e.preventDefault();
        return
      }
      isShortcut = true;
      reviewNotesSection.click();
    }
}

// Waiting for reivew notes section element loaded
$(document).arrive(reviewNotesSectionSelector, function() {
  console.log("init the ocv review notes auto fill tool...");
  init();
});

function init() {
  isShortcut = false;
  // get the elements
  let notesAndTrans = document.querySelector(notesAndTransSelector);
  reviewNotesSection = document.querySelector(reviewNotesSectionSelector);

  console.log("reviewNotesSection", reviewNotesSection);

 reviewNotesSection.onclick = function() {
  // add watcher for the reviewNotesSaveBtn element getCreatedElement
  $(document).arrive(reviewNotesSaveBtnSelector, function() {
    let notesTextArea = document.querySelector(notesTextAreaSelector)
    if (notesTextArea.value !== "") {
      return
    }
    let reviewNotesSaveBtn = $(this)[0]
    addNotes(notesTextArea).then(() => {
      if(isShortcut) {
        reviewNotesSaveBtn && reviewNotesSaveBtn.click();
      }
    })
  })
 }

  // When press review shortcut key 'r', click the reivew notes section
  document.onkeydown = reviewCase
}

addUtilTool();

]]></>).toString();
var c = Babel.transform(inline_src, { presets: [ "es2015", "es2016" ] });
eval(c.code);