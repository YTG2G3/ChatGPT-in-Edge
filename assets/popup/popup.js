// Display current question
chrome.storage.local.get(["token", "question", "choices"], (items) => {
    document.getElementById("token").value = items?.token;
    document.getElementById('q').innerText = `Question: ${items?.question}`;
    document.getElementById('c').innerText = `Choices: ${items?.choices.join(" | ")}`;
});

document.getElementById('sendtoken').onclick = () => {
    let token = document.getElementById("token").value;
    chrome.storage.local.set({ token });
    chrome.extension.sendMessage({ token }, (success) => document.getElementById("token").value = success ? "SUCCESS" : "FAILURE");
}