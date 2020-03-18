// ==UserScript==
// @name         OCV review case tool
// @namespace    http://tampermonkey.net/
// @version      0.4
// @description  shortcut for review case
// @author       Bruce Lu
// @include      https://ocv.microsoft.com/*
// @require      https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/6.18.2/babel.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/babel-polyfill/6.16.0/polyfill.js
// @require      https://code.jquery.com/jquery-3.1.1.min.js
// @require
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
let ribbonSelector =
  "body > div:nth-child(49) > div > div.view-port > div > triage-ribbon > div.ribbon";

let MIN = 4;
let MAX = 5;
let isShortcut = false;
let alias;
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
  return new Promise((resolve, reject) => {
    $(document).arrive(myFeedbackLinkSelector, function() {
      let myFeedbackLink = $(this)[0];
      let str = decodeURI(myFeedbackLink.href);
      alias = str.match(/([\w-]+)@[a-zA-Z_]+?\.[a-zA-Z]{2,3}/)[1];
      console.log("Get alias: ", alias)
      if (alias.length > 3) {
        resolve(alias)
      } else {
        reject("cannot get the alias")
      }
    })
  })
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
      console.log("Add review notes...")
      let reviewNotes = `${date}, ${alias}, ${reivewNotesTime}:\n${alias}, ${issuesText}`;
      node.value = reviewNotes;
      node.dispatchEvent(new Event("change"));
      resolve();
    } else {
      reject();
    }
  });
}

function changeReviewNotesTime(e) {
  e.stopPropagation()
  e.preventDefault()
  let min = document.getElementById("min-time").value || MIN;
  let max = document.getElementById("max-time").value || MAX;
  const timeController = document.getElementById("notes-time-controller")
  if (parseInt(min) > parseInt(max)) {
    alert(`Notes time invalid, max value must lager than min value. `)
    return
  } else {
    MIN = min;
    MAX = max;
    alert(`Notes time has changed between ${MIN} - ${MAX} `)
  }
}

function matchedURL(keyword) {
  let hash = location.hash
  return hash.startsWith(keyword) ? true : false
}


// Add util tool element in the page
async function addUtilTool() {
  if (matchedURL("#/triage/")) {
    await getAlias()
    $(document).arrive(ribbonSelector, { onceOnly: true }, function() {
      console.log("Add util tool to the page");
      let ribbonEle = $(this)[0];

      let myDailReviewedURL = `https://ocv.microsoft.com/#/discover/?searchtype=OcvItems&relDateType=all&offset=0&q=OcvAreas:(SetDate:${formateDate("-")} AND (SetBy:"${alias}"))&allAreas`;
      let ultilHTML = `
  <div id='util-container' style="position: fixed; width: 250px; top: 90px; right: 20px; overflow: hidden; z-index: 9999">
    <div class="daily-reviewed">
      <a href=${encodeURI( myDailReviewedURL )} target='_blank' onclick="event.stopPropagation();"
        style="background-color: #005A9E; color: white; display: inline-block;">DailyReviewed</a>
    </div>
    <div id="notes-time-controller" style="margin-top: 10px;">
      <p style="margin: 0;">Notes Time</p>
      <form>
        <input type="number" name="min" class="form-control" id="min-time" onclick="event.stopPropagation();" placeholder="min" value=${MIN} style="display: inline-block; width: 30%;" min="1" max="8">
        <input type="number" name="max" class="form-control" id="max-time" onclick="event.stopPropagation();" placeholder="max" value=${MAX} style="display: inline-block; width: 30%;" min="1" max="8">
        <button type="button" class="btn btn-primary" id="apply-btn" style="margin-top: -5px;">Apply</button>
      </form>
    </div>
  </div>

      `;
      ribbonEle.insertAdjacentHTML("beforeend", ultilHTML);
      let applyBtn = document.getElementById("apply-btn");
      applyBtn.addEventListener("click", changeReviewNotesTime)
    });


  }
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
      console.log("Saving the review notes...")
    }
}

// Waiting for reivew notes section element loaded
$(document).arrive(reviewNotesSectionSelector, function() {
  console.log("init the ocv review notes tool...");
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
      //document.removeEventListener('keydown', reviewCase)
      return
    }
    let reviewNotesSaveBtn = $(this)[0]
    addNotes(notesTextArea).then(() => {
      if(isShortcut) {
        reviewNotesSaveBtn && reviewNotesSaveBtn.click();
      }
      //document.removeEventListener('keydown', reviewCase)
    })
  })
 }

  // When press review shortcut key 'r', click the reivew notes section
  document.onkeydown = reviewCase
}

addUtilTool()

]]></>).toString();
var c = Babel.transform(inline_src, { presets: [ "es2015", "es2016" ] });
eval(c.code);