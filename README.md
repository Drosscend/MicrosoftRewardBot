# Microsoft rewards bot
Typecript application for automating microsoft rewards
This application is just for educational purposes.
I am not responsible for the use of this bot. Use it at your own risk.

## Requirements
- Node.js
- Edge browser

## Actual features
- [x] Headless mode
- [x] Search on bing (desktop and mobile)
- [ ] Open promotional links
- [ ] Polls
- [ ] Daily quiz

## Steps to install
```bash
git clone https://github.com/Drosscend/MiscrosoftRewardBot.git
cd MiscrosoftRewardBot
```
Edit the `modules/config.ts` file and change the `nbPtsPerSearch` value to the amount points you earn per search.

```bash
pnpm build # or npm build or yarn build
```

## Steps to use
1. Copy the `.env.example` file and rename it to `.env`
2. Fill in the required fields (if your password has special characters, you must add your password between double quotes)
3. Run the bot using `pnpm start` or `npm start` or `yarn start`

