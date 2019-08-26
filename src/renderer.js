/**
 * This file will automatically be loaded by webpack and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/application-architecture#main-and-renderer-processes
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.js` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */


import './index.css';

window.$ = require('jquery');
const fs = require('fs');




// global variables
var characters = ['Aquaman', 'Batman', 'Cyborg', 'Flash', 'Jessica Cruz', 'Simon Baz', 'Superman', 'Wonder Woman'];
var locations = ['Arkham Asylum', 'Bank', 'Batcave', 'City Hall', 'Daily Planet', 'Police Station', 'S.T.A.R Labs'];
var scenarios = [ 1, 2, 3, 4, 5, 6, 7,8]
var renderCharacters = []
var renderLocations = []
var renderScenarios = []
var isNew
var score

//render initial state 
$(document).ready(function(){


    $.each(characters, function(index, value) {
        renderCharacters.push('<tr id="' + value.split(' ')[0] + '"><td>' + value + '</td><td><input type="checkbox" name="card1" id="card1" value="1"><input type="checkbox" name="card2" id="card2" value="2"><input type="checkbox" name="card3" id="card3" value="3"></td></tr>')
    });

    $.each(locations, function(index,value) {
        
        renderLocations.push('<tr id=' + value.split(' ')[0] + '><td>' + value + '</td><td><input type="checkbox" name="damage1" id="damage1" value="1"><input type="checkbox" name="damage2" id="damage2" value="2"><input type="checkbox" id="damage3" name="damage3" value="3"><input type="checkbox" name="damage4" id="damage4" value="4"><input type="checkbox" id="damage5" name="damage5" value="5"></td></tr>')
    })

    $.each(scenarios, function (index, value) {
        renderScenarios.push('<tr id="scenario' + value + '"><td>' + value + '</td><td><input type="checkbox" name="attempt1" id="attempt1" value="1"><input type="checkbox" name="attempt2" id="attempt2" value="2"><input type="checkbox" name="attempt3" id="attempt3" value="3"></td></tr>')
    })
    $('#characters').html(renderCharacters.join(""));
    $('#locations').html(renderLocations.join(""));
    $('#scenarios').html(renderScenarios.join(""));
    fetch();
});

//button functions
$('#clear').on('click', clear);
$('#save').on('click', save);



// clear campaign
function clear() {
    var file = fs.readFileSync('db.json');
    var data = JSON.parse(file);
    var idValue = 1
    var campaigns = data.campaigns;
    data.campaigns = campaigns.filter((record) => {return record.id !== idValue})
    fs.writeFileSync('db.json', JSON.stringify(data, null, 2));
    fetch();
    saveMessage('clear')
    $(':input').prop('checked', false)
    $('#ray, #repairs, #krypto').val('')
    calculateVictoryScore();
}

//get data
function fetch() {

    let rawFile = fs.readFileSync('db.json');
    let response = JSON.parse(rawFile);
    renderResult(response);

}

//render data
function renderResult(result){
    if(result.campaigns[0]){
        var char = result.campaigns[0].characters;
        var locations = result.campaigns[0].locations;
        var scenario = result.campaigns[0].scenarios;
        var sideMissions = result.campaigns[0].sideMissions[0];

        $.each(char, (index, value) => {
            var n = $("#" + value.name.split(' ')[0] + "");
            var index = value.cards;
            for(var i = 1; i <= index; i++){
                n.find('#card' + i + '').prop('checked', true);
            }

        });

        $.each(locations, (index, value) => {
            var loc = $("#" + value.name.split(' ')[0] + "");
            var index = value.damage;

            for(var i = 1; i <= index; i++){
                loc.find('#damage' + i + '').prop('checked', true);
            }
        });

        $.each(scenario, (index, value) => {
            var s = $("#scenario" + value.scenario + "");
            var index = value.attempts;

            for(var i = 1; i <= index; i++){
                s.find('#attempt' + i + '').prop('checked', true);
            }
        })

        $.each(sideMissions, (index, value) => {
            if(value.name == 'Ray' && value.scenario > 0){
                $('#ray').val(value.scenario)
            }
            if(value.name == 'Krypto' && value.scenario > 0){
                $('#krypto').val(value.scenario)
            }
            if(value.name == 'Repairs' && value.scenario > 0){
                $('#repairs').val(value.scenario)
            }
        })
    }

    calculateVictoryScore()
}

function createForm(){
    var body = {
        campaigns: [
            {
                id: 1,
                characters: [

                ],
                locations: [

                ],
                scenarios: [

                ],
                sideMissions: [

                ]
            }
        ]

    }

    return body
}


//handles both update and create
function save() {
    
    var payload;

    payload = createForm();

    var char = $('#characters').children();

    for(let i = 0; i < char.length; i++){
        var b = $(char[i]).children()[1];
        var x = $(b)[0].children
        var arr = []
        for(let y = 0; y < x.length; y++){
            if($(x[y])[0].checked == true){
                arr.push($(x[y]).val())
            }
        }

        if(arr.length > 0){
            var obj = {
                name: $(char[i])[0].innerText.trim(),
                cards: Math.max(...arr)
            }

            payload.campaigns[0].characters.push(obj)
        }
    }

    var loc = $('#locations').children();

    for(let i = 0; i < loc.length; i++){
        var j = $(loc[i]).children()[1];
        var z = $(j)[0].children
        var arr = []
        for(let q = 0; q < z.length; q++){
            if($(z[q])[0].checked == true){
                arr.push($(z[q]).val())
            }
        }
        if(arr.length > 0){
            var obj = {
                name: $(loc[i])[0].innerText.trim(),
                damage: Math.max(...arr)
            }

            payload.campaigns[0].locations.push(obj)
        }
        
    }

    var scen = $('#scenarios').children();

    for(let i = 0; i < scen.length; i++){
        var g = $(scen[i]).children()[1];
        var y = $(g)[0].children
        var arr = []
        for(let u = 0; u < y.length; u++){
            if($(y[u])[0].checked == true){
                arr.push($(y[u]).val())
            }
        }

        if(arr.length > 0){
            var obj = {
                scenario: parseInt($(scen[i])[0].innerText),
                attempts: Math.max(...arr)
            }

            payload.campaigns[0].scenarios.push(obj)
        }
        
    }

    var sideMissions = $('#sideMissions')

    var missions = [
        {
            name: "Ray",
            scenario: parseInt(sideMissions.find('#ray').val())
        },
        {
            name: "Krypto",
            scenario: parseInt(sideMissions.find('#krypto').val())
        },
        {
            name: "Repairs",
            scenario: parseInt(sideMissions.find('#repairs').val())
        }
    ]

    payload.campaigns[0].sideMissions.push(missions)
    writeSave(payload)

}

function saveMessage(status){

    $('#saveMessage').children().remove()
    if(status == 'success'){

        var message = '<p>Campaign progress has been saved.</p>'
        $('#saveMessage').append(message).css("color", "green");
        
        setTimeout(() => {
            $('#saveMessage').children().remove()
        }, 3000);

        return
    }
    if(status == 'error'){
        var message = '<p>There was an error saving your campaign.</p>';
        $('#saveMessage').append(message).css("color", "red");
        
         setTimeout(() => {
            $('#saveMessage').children().remove()
        }, 3000);

        return
    }
    if(status == 'clear'){
        var message = '<p>Campaign has been reset.</p>';
        $('#saveMessage').append(message).css("color", "green");

         setTimeout(() => {
            $('#saveMessage').children().remove()
        }, 3000);

        return
    }
}

function calculateVictoryScore(){
    var n = $('#scenarios').children();
    var scenarioScore = 0
    for(let i = 0; i < n.length; i++){
        var attempt1 = $(n[i]).find('#attempt1');
        var attempt2 = $(n[i]).find('#attempt2');
        var attempt3 = $(n[i]).find('#attempt3');

        if($(attempt1)[0].checked == true && $(attempt2)[0].checked == false && $(attempt3)[0].checked == false){

            scenarioScore += 3;
        }
        if($(attempt2)[0].checked == true && $(attempt3)[0].checked == false){
            scenarioScore += 1
        }
        if($(attempt3)[0].checked == true){
            scenarioScore -= 1
        }
    }

    var ray = $('#ray').val()
    var krypto = $('#krypto').val()
    var repair = $('#repairs').val()

    if(ray > 0){

        scenarioScore += 1
    }
    
    if(krypto > 0){
        scenarioScore += 1
    }

    if(repair > 0){
        scenarioScore += 1
    }

    var loc = $('#locations').children();
    var inputs = $(loc).find(':checked');

    if(inputs.length <= 0){
        scenarioScore += 2
    }
    
    victoryTitles(scenarioScore);
    $('#finalScore').html(scenarioScore);

}

function writeSave(body){
    let data = JSON.stringify(body);
    fs.writeFileSync('db.json', data);
    saveMessage('success');
    calculateVictoryScore();
}

function victoryTitles(score){
    console.log(score)
    var message;
    //24 + Major Victory
    //17+ Partial Victory
    //10+ Pyrrhic Victory
    //9 or less Defeat

    if(score >= 24){
        message = 'Major Victory'
    } else if (score < 24 && score >= 17) {
        message = 'Partial Victory'
    } else if (score < 17 && score >= 10) {
        message = 'Pyrrhic Victory'
    } else {
        message = 'Defeat'
    }
    console.log(message)
}



