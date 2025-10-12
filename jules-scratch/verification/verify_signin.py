from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        # Navigate to the login page
        page.goto("http://localhost:3000/login")

        # Fill in the email
        page.get_by_placeholder("Enter your email").fill("testuser@example.com")

        # Click the sign-in button
        page.get_by_role("button", name="Sign In").click()

        # Wait for navigation to the dashboard and for the welcome message to be visible
        expect(page).to_have_url("http://localhost:3000/dashboard")
        expect(page.get_by_text("Welcome back,")).to_be_visible()

        # Take a screenshot of the dashboard
        page.screenshot(path="jules-scratch/verification/verification.png")

    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)