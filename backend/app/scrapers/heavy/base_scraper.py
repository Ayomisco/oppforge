from playwright.async_api import async_playwright
import random
import logging
import asyncio

class BasePlaywrightScraper:
    def __init__(self, headless=True):
        self.headless = headless
        self.logger = logging.getLogger(self.__class__.__name__)
        
        # State
        self.playwright = None
        self.browser = None
        self.context = None
        self.page = None
        
        # Rotational User Agents
        self.user_agents = [
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/119.0"
        ]

    async def _get_page(self):
        """
        Initializes Playwright and returns a page with stealth settings.
        """
        if self.page:
            return self.page

        self.playwright = await async_playwright().start()
        
        self.browser = await self.playwright.chromium.launch(
            headless=self.headless,
            args=[
                "--disable-blink-features=AutomationControlled",
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-infobars",
                "--window-position=0,0",
                "--ignore-certifcate-errors",
                "--ignore-certifcate-errors-spki-list",
                f"--user-agent={random.choice(self.user_agents)}"
            ]
        )
        
        self.context = await self.browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            user_agent=random.choice(self.user_agents),
            locale="en-US",
            timezone_id="America/New_York"
        )
        
        # Anti-detection scripts
        await self.context.add_init_script("""
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined
            });
        """)
        
        self.page = await self.context.new_page()
        return self.page

    async def _close(self):
        """
        Clean up resources.
        """
        if self.page: await self.page.close()
        if self.context: await self.context.close()
        if self.browser: await self.browser.close()
        if self.playwright: await self.playwright.stop()
        
        self.page = None
        self.context = None
        self.browser = None
        self.playwright = None

    async def _auto_scroll(self, page):
        """
        Scrolls down the page to trigger lazy loading.
        """
        try:
            prev_height = -1
            max_scrolls = 10
            scroll_count = 0
            
            while scroll_count < max_scrolls:
                await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                await asyncio.sleep(1)
                new_height = await page.evaluate("document.body.scrollHeight")
                if new_height == prev_height:
                    break
                prev_height = new_height
                scroll_count += 1
        except Exception as e:
            self.logger.warning(f"Auto-scroll failed: {e}")

    async def safe_goto(self, page, url, wait_for=None):
        try:
            self.logger.info(f"Navigating to {url}")
            await page.goto(url, wait_until="domcontentloaded", timeout=60000)
            
            # Mimic human behavior
            await page.mouse.move(random.randint(100, 500), random.randint(100, 500))
            await asyncio.sleep(random.uniform(1.5, 3.5))
            
            if wait_for:
                try:
                    await page.wait_for_selector(wait_for, timeout=10000)
                except:
                    self.logger.warning(f"Selector {wait_for} not found, proceeding anyway.")
            
            return True
        except Exception as e:
            self.logger.error(f"Failed to load {url}: {e}")
            return False
