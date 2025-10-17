from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    page.goto("http://localhost:3000")

    # Fill in the form to generate an email
    page.get_by_label("What do you want to say? *").fill("Test email")
    page.get_by_label("Recipient").fill("test@example.com")
    page.get_by_label("Your Name").fill("Test User")

    # Click the generate button
    page.get_by_role("button", name="Try Free Generation with Gemini").click()

    # Wait for the email to be generated
    expect(page.get_by_text("Subject:")).to_be_visible(timeout=60000)

    # Take a screenshot
    page.screenshot(path="jules-scratch/verification/verification.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)