// Load ChatGPT
import { ChatGPTUnofficialProxyAPI } from "chatgpt";
let gpt = null;

// Reset storage
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({ token: "" });
    chrome.storage.local.set({ question: "" });
    chrome.storage.local.set({ choices: [] });
});

// GPT init
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    let { token } = request;
    gpt = new ChatGPTUnofficialProxyAPI({ accessToken: token });

    gpt.sendMessage("Respond with 'Hello World'").then(() => {
        console.log("Connected");
    });
})

chrome.commands.onCommand.addListener((command) => {
    if (command === "clearChoice") return chrome.storage.local.set({ choices: [] });
    else if (command === "answer") {
        chrome.storage.local.get(["question", "choices"], async (items) => {
            let q = `Answer this question based on the novel The Great Gatsby:\n${items.question}\n\nThe choices are:\n${items.choices.map((v, i) => `${i + 1}. ${v}`).join("\n")}\n\nYou must respond only in numbers, without any explanation on the answer nor the answer itself.`
            gpt.sendMessage(q).then((r) => {
                let resp = r.text;

                chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
                    let tabId = tabs[0].id;

                    chrome.scripting.executeScript({
                        target: { tabId, allFrames: true },
                        func: (resp) => {
                            let i = document.getElementById("ans") ?? document.createElement("p");
                            i.id = "ans";
                            i.innerText = resp;
                            i.style = "position: fixed; left: 5px; bottom: 5px; color: white; z-index: 5000;";
                            document.body.appendChild(i);
                        },
                        args: [resp]
                    });
                });
            });
        });
    }
    else chrome.tabs.query(
        { currentWindow: true, active: true },
        async (tabs) => {
            let tabId = tabs[0].id;

            let res = await chrome.scripting.executeScript({
                target: { tabId, allFrames: true },
                func: () => window.getSelection().toString()
            });

            let txt = res[0].result;

            if (command === "setQuestion") chrome.storage.local.set({ question: txt });
            else if (command === "addChoice") {
                chrome.storage.local.get(["choices"], (items) => {
                    let prev = items.choices;
                    chrome.storage.local.set({ choices: [...prev, txt] });
                });
            }
        });
});