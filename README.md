## What is Syrch?

[Syrch](https://syrch.org/) is a sophisticated URL generation and processing engine that creates random website addresses and checks if they're active. It uses custom functions to generate realistic domain names using:

## Features
### Generation Properties
#### **Filters** - Uses curated lists (countries, materials, music genres, etc.) See: [Dictionary](https://github.com/Tukyo/syphersearch/tree/main/src/dict) 
> *Filters are applied **with** the generation mode that is selected.*

#### **Custom Word Integration** - Insert your own words into the URL
**Insert Modes** - prefix, suffix, or random placement

#### **Character Sets** - Choose what characters can appear in generated URLs 
Alphabetic, numeric, or alphanumeric character generation

#### **Generation Modes** - Change paramaters to drastically alter the way URLs are generated
**Random** - Completely random letter placement, purely restricted by the length limits.

**Phonetics** - Uses phonetics patterns to generate the URL. This is done using "CV" patterns, where C = consonant, and V = vowel. An example pattern would by "CVC". This pattern can be used to create many words, such as "Mom" "Dog" or "Hat".

**Syllables** - Builds natural-sounding combinations using syllables such as "a", "ma", "ban", "ly", "bit" and many more.

**Optional Clusters** - Optionally, you can insert letter combinations like "th", "st", "ch" into your serches as well, in combination with the generation patterns.
  
#### **URL Setup** - Change specific settings for the URLs
**Domain Selection** - Select which domains you want to use for the URL generation.

 
There is also a help section on the Syrch website that can be accessed while using the app to get direct help with each setting. As settings change and features are added or altered this will change. Above are the core features that are needed to process and generate URLs.

## 🛠️ Technology Stack

- **Frontend**: TypeScript, CSS, HTML
- **Backend**: Firebase Firestore for data persistence
- **Libraries**: 
  - Particles.js for animated background effects
  - Ethers.js for blockchain integration (SyrchPro features)
  - SypherTools.js for EIP6963 provider discovery and wallet connection

## 🔐 Privacy & Security

- **Data Collection** - Syrch stores your wallet address and uses it as your profile identifer. This allows you to favorite sites, and when favorited they become available for other users. It also allows me to make your experience more convenient. You should hopefully not see the same site generated multiple times, and you will be able to keep a record of any sites you have found.
- **Client-Side Processing** - All URL generation happens in your browser
- **Secure Connections** - All external requests use HTTPS
- **Use At Your Own Risk** - I cannot control what happens once you leave Syrch and navigate to any websites you find. None of the websites are vetted, they are not even known to me. Once you begin a search it will be unique and unpredictable, so please be careful when clicking anything on any websites you travel to.

## 🤝 Contributing
This project is open source! I wrote this app myself, and I'm happy to receive any feedback or suggestions. 

Feel free to reach out to me on [Telegram](https://t.me/tukyohub) if you need anything.

## 📄 License

This project is licensed under the CC0 specified in the [LICENSE](LICENSE) file.

---

**Discover the hidden corners of the internet with Syrch!** 🌐