from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()
    page.goto("http://localhost:3000/login")
    page.screenshot(path="jules-scratch/verification/login_page.png")
    page.goto("http://localhost:3000/register")
    page.screenshot(path="jules-scratch/verification/register_page.png")
    browser.close()

with sync_playwright() as playwright:
    run(playwright)