const config = window.LEAD_INBOX || {};

const form = document.querySelector("#waitlist");
const setup = document.querySelector("#setup");
const thanks = document.querySelector("#thanks");
const errorBox = document.querySelector("#form-error");

function endpoint() {
  if (config.endpoint) return config.endpoint;
  if (config.notifyEmail) {
    return "https://formsubmit.co/ajax/" + encodeURIComponent(config.notifyEmail);
  }
  return "";
}

const url = endpoint();

if (!url) {
  form.hidden = true;
  setup.hidden = false;
} else {
  form.hidden = false;
  setup.hidden = true;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  errorBox.hidden = true;

  const data = new FormData(form);
  if (data.get("_honey")) return;

  const email = String(data.get("email") || "").trim();
  const product = String(data.get("product") || "").trim();
  if (!email || !product) {
    errorBox.textContent = "Add your email and what you sell.";
    errorBox.hidden = false;
    return;
  }

  const button = form.querySelector("button");
  button.disabled = true;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        email,
        product,
        _subject: "Lead Inbox waitlist",
      }),
    });
    const result = await response.json().catch(() => null);
    const accepted = result && String(result.success) === "true";

    if (!response.ok || !accepted) {
      const detail = result && result.message ? result.message : "Form was not accepted";
      throw new Error(detail);
    }

    form.hidden = true;
    thanks.hidden = false;
  } catch (error) {
    errorBox.textContent = error.message || "That did not send. Check the address and try again.";
    errorBox.hidden = false;
    button.disabled = false;
  }
});
