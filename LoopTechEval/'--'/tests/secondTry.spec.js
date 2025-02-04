const { test, expect } = require('@playwright/test');
const logger = require('./logger');
const testData = require('./testData.json');

// Login function
async function login(page) {
  logger.info('Logging In');
  await page.goto('https://animated-gingersnap-8cf7f2.netlify.app/');
  await page.fill('input[id = "username"]', 'admin');
  await page.fill('input[id = "password"]', 'password123');
  await page.click('button[type="submit"]');
}

// Logout function
async function logout(page) {
  logger.info('Logging Out');
  await page.getByRole('button', { name: 'Logout' }).click();
}

// Validating relationship
async function validateRelationship(card, column) {
  logger.info('Validating Relationship');
  const colParent = column.locator('..');
  const cardGrandparent = await card.locator('../..');
  const colParentBox = await colParent.boundingBox();
  const cardGrandparentBox = await cardGrandparent.boundingBox();
  await expect(colParentBox).toEqual(cardGrandparentBox);
}

async function validateTags(page, card, tags) {
  const tagList = await card.locator('.flex.flex-wrap.gap-2.mb-3');
  let tagListCount = await card.locator('.flex.flex-wrap.gap-2.mb-3').count();
  logger.debug("I found " + tagListCount + " tag lists")
  page.waitForSelector('.flex.flex-wrap.gap-2.mb-3');
  //--Loop through each tag and check if it exists in the card
  await card.locator('.flex.flex-wrap.gap-2.mb-3').waitFor({ state: 'visible' });
  for (const tag of tags) {
    logger.debug(`Looking for tag '${tag}'`);
    //--Find all spans within the div
    const tagCount = await tagList.locator('span').filter({ hasText: new RegExp(`^${tag}$`, 'i') }).count();
    logger.debug(`Found ${tagCount} instances of tag '${tag}'`);
    await expect(tagCount).toEqual(1);
  }
}

// Function to verify task details
async function verifyTask(page, project, taskName, columnName, tags) {
  logger.info('Verifying Task Details');
  //Confirm data
  logger.debug('Verifying Task Details');
  logger.debug(`Looking for project ${project}`);
  logger.debug(`Task ${taskName}`);
  logger.debug(`In column ${columnName}`);
  logger.debug(`With tags: ${tags.join(', ')}`);

  //Finding the project
  await page.click(`text=${project}`);
  let title = await page.getByRole('heading', { name: `${project}`, level: 1 });
  await expect(title).toHaveCount(1);

  //Finding the card
  const thisCardTitle = await page.getByRole('heading', { name: `${taskName}` });
  const card = await thisCardTitle.locator('..');

  //Finding the column
  let column = await page.getByRole('heading', { name: new RegExp(`${columnName} \\(\\d+\\)`) });

  // Validating relationship
  await validateRelationship(card, column);

  //Validating tags
  await validateTags(page, card, tags);
}

// Test suite for Asana Demo App
test.describe('Asana Demo App Tests', () => {
  let page;
  test.beforeEach(async ({ page }) => {
    await login(page);
  });
  test.afterEach(async ({ page }) => {
    await logout(page);
  });
  let runCount = 0;
  for (const data of testData) {
    const project = data.project;
    const taskName = data.taskName;
    const column = data.column;
    const tags = data.tags;
    runCount++;
    const testName = runCount + ": " + taskName


    test(testName, async ({ page }) => {
      await verifyTask(page, project, taskName, column, tags);
    });
  }


}
);