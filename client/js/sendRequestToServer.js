import { getImageFromDallE } from './dallE.js';

const chatEndpointURL = 'http://localhost:3001/chat';
const imageEndpointURL = 'http://localhost:3001/image';
const speechEndpointURL = 'http://localhost:3001/speech';

let outputElement, submitButton, inputElement, historyElement, buttonElement;

window.onload = init;

function init() {
    outputElement = document.querySelector('#output');
    submitButton = document.querySelector('#submit');
    submitButton.onclick = handleSubmit;

    inputElement = document.querySelector('input');
    historyElement = document.querySelector('.history');
    buttonElement = document.querySelector('button');
    buttonElement.onclick = clearInput;
}

function clearInput() {
    inputElement.value = '';
}

async function handleSubmit() {
    let prompt = inputElement.value.trim().toLowerCase();
    if (!prompt) {
        console.log("Prompt is empty");
        return;
    }

    if (prompt.startsWith('/image')) {
        const imagePrompt = prompt.replace('/image', '').trim();
        await getImage(imagePrompt);
    } else if (prompt.startsWith('/speech')) {
        const speechPrompt = prompt.replace('/speech', '').trim();
        await getSpeechResponse(speechPrompt);
    } else {
        await getChatResponse(prompt);
    }

    inputElement.value = '';
}

async function getImage(prompt) {
    if (!prompt) {
        console.log("Image prompt is empty");
        return;
    }

    try {
        let images = await getImageFromDallE(prompt);
        console.log(images);

        images.data.forEach(imageObj => {
            const imageContainer = document.createElement('div');
            imageContainer.classList.add('image-container');

            const imgElement = document.createElement('img');
            imgElement.src = imageObj.url;
            imgElement.width = 256;
            imgElement.height = 256;

            imageContainer.append(imgElement);
            outputElement.append(imageContainer);
        });
    } catch (error) {
        console.error("Error generating image:", error);
    }
}

async function getChatResponse(prompt) {
    try {
        const promptData = new FormData();
        promptData.append('prompt', prompt);

        const response = await fetch(chatEndpointURL, {
            method: 'POST',
            body: promptData
        });

        if (!response.ok) {
            throw new Error('Failed to fetch chat response');
        }

        const data = await response.json();
        console.log(data);

        const chatGptResponseTxt = data.choices[0].message.content;
        
        // Afficher la réponse du chat
        const pElementChat = document.createElement('p');
        pElementChat.textContent = chatGptResponseTxt;
        outputElement.append(pElementChat);

        addToHistory(prompt);

        // Retourner la réponse du chat
        return chatGptResponseTxt;
    } catch (error) {
        console.error("Error getting chat response:", error);
    }
}

async function getSpeechResponse(prompt) {
    if (!prompt) {
        console.log("Speech prompt is empty");
        return;
    }

    try {
        // Utiliser getChatResponse pour obtenir la réponse du chat
        const chatResponse = await getChatResponse(prompt);
        
        if (chatResponse) {
            // Utilisation de Web Speech API pour la synthèse vocale
            const utterance = new SpeechSynthesisUtterance(chatResponse);
            utterance.lang = 'fr-FR'; // Langue de la synthèse vocale

            // Commence la synthèse vocale
            speechSynthesis.speak(utterance);

            addToHistory('/speech ' + prompt);
        }
    } catch (error) {
        console.error("Error with speech response:", error);
    }
}

function addToHistory(prompt) {
    const pElement = document.createElement('p');
    pElement.textContent = prompt;
    pElement.onclick = () => {
        inputElement.value = pElement.textContent;
    };
    historyElement.append(pElement);
}
