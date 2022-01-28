'use strict';

let db;

function setupDB() {
    return new Promise((resolve, reject) => {
        if (db) { resolve; return; }

        const DATABASE_NAME = 'battlelogdb';
        let request = indexedDB.open(DATABASE_NAME, 1);

        request.onupgradeneeded = function (e) {
            db = e.target.result;
            if (!db.objectStoreNames.contains('journals')) db.createObjectStore('journals', { keyPath: 'id' });
            if (!db.objectStoreNames.contains('officers')) db.createObjectStore('officers', { keyPath: 'officerId' });
            if (!db.objectStoreNames.contains('ships')) db.createObjectStore('ships', { keyPath: 'shipId' });
            if (!db.objectStoreNames.contains('ships')) db.createObjectStore('ships', { keyPath: 'shipId' });
        };

        request.onsuccess = function (e) {
            db = e.target.result;
            resolve();
        }

        request.onerror = function (e) {
            reject(`error opening db ${e.target.errorCode}`);
        }
    })
}

function populateDB() {
    return new Promise((resolve, reject) => {
        let tx = db.transaction(['officers', 'ships'], 'readwrite');

        loadOfficers(tx);
        loadShips(tx);

        tx.oncomplete = ((e) => { console.log('populated db'); resolve; });
    })
}

function loadOfficers(tx) {
    let officers = tx.objectStore("officers");

    officers.add({ "officerId": 177664289, "officerName": "Beverly Crusher", "officerAbilities": [{ "officerAbilityId": 697043235, "officerAbility": "Unshakeable Moral Code" }, { "officerAbilityId": 4222722823, "officerAbility": "First, Do No Harm" }] });
    officers.add({ "officerId": 307877748, "officerName": "Frank Leslie", "officerAbilities": [{ "officerAbilityId": 2079302126, "officerAbility": "Minor Damage Control" }] });
    officers.add({ "officerId": 766809588, "officerName": "Spock", "officerAbilities": [{ "officerAbilityId": 2500262645, "officerAbility": "Illogical" }] });
    officers.add({ "officerId": 988947581, "officerName": "Kirk", "officerAbilities": [{ "officerAbilityId": 2068068163, "officerAbility": "Inspirational" }, { "officerAbilityId": 4102716881, "officerAbility": "Leader" }] });
    officers.add({ "officerId": 1465017198, "officerName": "Gorkon", "officerAbilities": [{ "officerAbilityId": 3732921554, "officerAbility": "Creating Opportunities" }] });
    officers.add({ "officerId": 2822661458, "officerName": "Khan Noonien Singh", "officerAbilities": [{ "officerAbilityId": 4235813457, "officerAbility": "Savage Tenacity" }] });
    officers.add({ "officerId": 3583932904, "officerName": "Five of Eleven", "officerAbilities": [{ "officerAbilityId": 1107085046, "officerAbility": "Weaponry is irrelevant" }] });
    officers.add({ "officerId": 3923643019, "officerName": "Leonard McCoy", "officerAbilities": [{ "officerAbilityId": 1520108895, "officerAbility": "Excellent Medicine" }, { "officerAbilityId": -1, "officerAbility": "I'm a Doctor, not a ..." }] });
    officers.add({ "officerId": 3304441016, "officerName": "Seven of Eleven", "officerAbilities": [{ "officerAbilityId": 1955519035, "officerAbility": "Strengthen the Unimatrix" }, { "officerAbilityId": -1, "officerAbility": "Resistance is Futile" }] });
    officers.add({ "officerId": 1859906553, "officerName": "Nine of Eleven", "officerAbilities": [{ "officerAbilityId": 149413627, "officerAbility": "Adapt & Overcome" }, { "officerAbilityId": -1, "officerAbility": "Borg Polarization" }] });
}

function loadShips(tx) {
    let ships = tx.objectStore("ships");

    ships.add({
        "shipId": 293385368, "shipName": "Stella", "shipComponents": [
            { "shipComponentId": 1194231363, "shipComponent": "Photonic Torpedoes [KINETIC]" },
            { "shipComponentId": 3968960753, "shipComponent": "Pulsed Phaser [ENERGY]" },
            { "shipComponentId": 838611638, "shipComponent": "Photonic Torpedoes [KINETIC]" },
            { "shipComponentId": 1904526923, "shipComponent": "Pulsed Phaser [ENERGY]" }]
    });
    ships.add({
        "shipId": 4130274289, "shipName": "Exchange Bank", "shipComponents": [
            { "shipComponentId": 3268839663, "shipComponent": "Weapon [ENERGY]" },
            { "shipComponentId": 1574321489, "shipComponent": "Weapon [KINETIC]" }]
    });
    ships.add({
        "shipId": 4139081582, "shipName": "Exchange Transport", "shipComponents": [
            { "shipComponentId": 2244499741, "shipComponent": "Weapon [??]" },
            { "shipComponentId": -1, "shipComponent": "Weapon [??]" }]
    });
}

function addDOMEvents() {
    document.querySelector('#fileUploadPicker').addEventListener('change', () => { document.querySelector('#fileUploadAdd').disabled = false; }, false);
    document.querySelector('#fileUploadAdd').addEventListener('click', handleFileUpload, false);
    //document.querySelector('#processButton').addEventListener('click', requestFile, false);
}

function handleFileUpload(e) {
    var file = document.querySelector('#fileUploadPicker').files[0];
    let reader = new FileReader();
    reader.onload = handleFileRead;
    reader.readAsText(file);
    document.querySelector('#processButton').disabled = false;
    document.querySelector('#fileUploadPicker').value = "";
    document.querySelector('#fileUploadAdd').disabled = true;
}

function handleFileRead(e) {
    let tx = db.transaction(['journals'], 'readwrite');
    let journals = tx.objectStore('journals');

    let save = JSON.parse(e.target.result);
    if (save.journal.id) journals.add(save.journal);

    tx.oncomplete = () => { updateProcessButton() };
}

function updateProcessButton() {
    let tx = db.transaction(['journals']);
    let journals = tx.objectStore('journals');

    let req = journals.count();
    req.onsuccess = () => { console.log(req.result) };
}