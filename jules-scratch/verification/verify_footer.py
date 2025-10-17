from playwright.sync_api import Page, expect
import os

def test_footer(page: Page):
    page.goto("http://localhost:3000")

    # Expect the "Connect with Jaweria Batool" link to be gone.
    expect(page.get_by_role("link", name="Connect with Jaweria Batool")).not_to_be_visible()

    # Expect the "AI Expert" link to be gone.
    expect(page.get_by_text("AI Expert")).not_to_be_visible()

    page.screenshot(path="jules-scratch/verification/verification.png")