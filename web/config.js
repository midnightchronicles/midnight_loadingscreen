const Config = {
  serverName: "Server_name",

  backgroundImages: [
    "https://r2.fivemanage.com/XMMEvW9JygawUCoh23aGp/CHANGE-ME.png",
  ],
  backgroundInterval: 8000,
  backgroundTransition: 1500,
  loadingMessageInterval: 4500,

  sound: "mp3",
  defaultVolume: 70, // 0–100, starting volume for the music player
  tracks: [
    { file: "track1.mp3", title: "Party House - Kung Pao O'Malley" },
    { file: "track2.mp3", title: "I Feel It All So Deeply - Bail Bonds" },
  ],

  owners: [ //only supports 2 owners
    {
      name:  "Staff Name",
      role:  "Owner",
      image: "https://r2.fivemanage.com/XMMEvW9JygawUCoh23aGp/CHANGE-ME.png",
    },
    // {
    //   name:  "Second Owner",
    //   role:  "Co-Owner",
    //   image: "https://r2.fivemanage.com/XMMEvW9JygawUCoh23aGp/CHANGE-ME.png",
    // },
  ],

  staff: [
    {
      name:  "Another Staff",
      role:  "Another Role",
      image: "https://r2.fivemanage.com/XMMEvW9JygawUCoh23aGp/CHANGE-ME.png",
    },
    {
      name:  "Another Staff",
      role:  "Another Role",
      image: "https://r2.fivemanage.com/XMMEvW9JygawUCoh23aGp/CHANGE-ME.png",
    },
  ],

  showServerVersion: true, // false hides the version banner on the Updates tab
  updateVersion: "1.0.0", // your server version

  rules: [
    {
      title: "random rule",
      text: "rule description",
    },
    {
      title: "random rule",
      text: "rule description",
    },
  ],

  updates: [
    {
      current: true,
      title: "Random Update",
      text: "New housing interiors and furniture options are now live.",
      date: "Jun 2026",
    },
    {
      title: "Economy Tweaks",
      text: "Balanced job payouts and adjusted vehicle prices.",
      date: "May 2026",
    },
  ],
};
