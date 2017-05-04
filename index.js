/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/
/**
 * This sample demonstrates a simple skill built with the Amazon Alexa Skills
 * nodejs skill development kit.
 * This sample supports multiple lauguages. (en-US, en-GB, de-DE).
 * The Intent Schema, Custom Slots and Sample Utterances for this skill, as well
 * as testing instructions are located at https://github.com/alexa/skill-sample-nodejs-fact
 **/

'use strict';

const Alexa = require('alexa-sdk');
//const express = require ('express');
//const https = require ('https');
const request = require('request');
//const utils = require ('utils');
require('date-utils');
const APP_ID = undefined;  // TODO replace with your app ID (OPTIONAL).



const handlers = {
    'LaunchRequest': function () {
        //if no amazon token, return a LinkAccount card
        if (this.event.session.user.accessToken === undefined) {
            this.emit(':tellWithLinkAccountCard', 'to start using this skill, please use the companion app to authenticate on Amazon');
            return;
        } else {
            this.emit(':tell', "Team snap");
        }
        //this.emit('GetFact');
    },
    'ListPlayers': function () {
        //        this.emit(':tellWithCard',"GetPlayers");
        this.emit('GetPlayers');
    },
    'GetPlayers': function () {
        var accessToken = this.event.session.user.accessToken;
        var self = this; // to avoid emit failure in a deep nest
        var dt = new Date();
        //  var yesterday = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate() - 1);
        var formatteddt = dt.toFormat("YYYY-MM-DD");
        var uurl = '';  //availability url for next game
        var member = ''; //member names to display/tell
        var member_id_list = {
            "13960517": "Chisa",
            "19522385": "Payton",
            "33629624": "Stephany",
            "29666598": "Marie",
            "3833618": "Lia",
            "14168259": "Cameron",
            "7211242": "Finley",
            "38894003": "Ruby",
            "19950030": "Sarah",
            "19522350": "Aditi",
            "33629608": "Emma",
            "24647326": "April",
            "1707206": "Rachel",
            "19522376": "Mia",
            "3834093": "Katherine",
            "19950010": "Caoimhe",
            "33629619": "Zoe",
            "19522371": "Kaley"
        } //member id-name list
        var start_date = ''; //game start date
        var opponent_name = ''; //opponent name
        var location_name = ''; //game location
        var result_sentence = ''; // final result to send/tell
        console.log('first');
        request({
            url: 'https://apiv3.teamsnap.com/v3/events/search?team_id=132470&page_size=1&is_game=true&started_after=' + formatteddt,
            auth: {
                'bearer': accessToken
            }
        }, function (err, ress) {
            var resultjson = JSON.parse(ress.body);
            console.log('second');
            for (var i in resultjson.collection.items[0].links) {
                var line = resultjson.collection.items[0].links.filter(function (item, index) {
                    if (item.rel == "availabilities") uurl = item.href;
                })
            }
            for (var i = 0; i < resultjson.collection.items[0].data.length; i++) {
                if ((resultjson.collection.items[0].data[i].name) == 'start_date') {
                    start_date = resultjson.collection.items[0].data[i].value;
                    var tdate = new Date(start_date);
                    start_date = tdate.toFormat("MM-DD");
                }
                if ((resultjson.collection.items[0].data[i].name) == 'opponent_name') {
                    opponent_name = resultjson.collection.items[0].data[i].value;
                }
                if ((resultjson.collection.items[0].data[i].name) == 'location_name') {
                    location_name = resultjson.collection.items[0].data[i].value;
                }
            }

            request({
                url: uurl,
                auth: {
                    'bearer': accessToken
                }
            }, function (err, resss) {
                console.log('third');

                var resultjson = JSON.parse(resss.body);
                for (var i in resultjson.collection.items) {
                    var status_code = '';
                    var member_id = ''
                    for (var j = 0; j < resultjson.collection.items[i].data.length; j++) {
                        if ((resultjson.collection.items[i].data[j].name == "status_code")) {
                            status_code = resultjson.collection.items[i].data[j].value;
                        }
                        if (resultjson.collection.items[i].data[j].name == "member_id") {
                            member_id = resultjson.collection.items[i].data[j].value;
                        }
                    }
                    if (status_code == "1") {
                        member = member + member_id_list[member_id] + ',';
                    }
                }
                result_sentence = 'game versus ' + opponent_name + ', at , <say-as interpret-as="date" format="md">' + start_date + '</say-as>, available members are ' + member + ' in ' + location_name;
                console.log('fourth');
                self.emit(':tell', result_sentence);
            });
            // Create speech output
            //const speechOutput = this.t('GET_FACT_MESSAGE') + accessToken;
            //this.emit(':tellWithCard', speechOutput, this.t('SKILL_NAME'), accessToken);
            //this.emit(':tell','I got the response from teamsnap.');
        });

        //        console.log (result_sentence);
        //        this.emit(':tell', 'game versus Juventus SC 05G Black at 2017-05-06T16:00:07Z, available members are Rachel,Lia,Katherine,Finley,Chisa,Aditi,Kaley,Payton,Sarah,April,Marie,Emma,Zoe, in Red Mortan 49-E, Red Mortan Community Park');
    },
    'AMAZON.HelpIntent': function () {
        const speechOutput = this.t('HELP_MESSAGE');
        const reprompt = this.t('HELP_MESSAGE');
        this.emit(':ask', speechOutput, reprompt);
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },
    'SessionEndedRequest': function () {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },
    'Unhandled': function () {
        this.emit(':tell', 'Unhandled');
    },
};

exports.handler = (event, context) => {
    const alexa = Alexa.handler(event, context);
    //alexa.APP_ID = APP_ID;
    // To enable string internationalization (i18n) features, set a resources object.
    //        alexa.resources = languageStrings;
    alexa.registerHandlers(handlers);
    alexa.execute();
};
/*
function httpsGet(myData, callback) {
    //options
    var options = {
        host: 'apiv3.teamsnap.com',
        port: 443,
        path: '/vs/me',
        method: 'GET',
    };
    
    var req = https.request(options, res => {
        res.setEncoding('utf8');
        var returnData = "";
        
        res.on('data', chunk => {
            returnData = returnData + chunk;
        });
        
        res.on('end', () => {
            var pop = JSON.parse(returnData).population;
            callback (pop);
        });
    });
    req.end();
}
*/