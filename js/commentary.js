/* ==========================================================================
   Javed Jaffrey Style Commentary Engine for Takeshi's Castle
   ========================================================================== */

const COMMENTARY_DATABASE = {
    hi: {
        stageStart: [
            "चलिए दोस्तों! शुरू करते हैं ताकेशी का यह धमाकेदार खेल!",
            "अरे बाप रे! क्या खतरनाक स्टेज है बॉस!",
            "हमारे सिरफिरे खिलाड़ी आज ताकेशी के किले पर धावा बोलने वाले हैं!"
        ],
        steppingStonesNearMiss: [
            "ओह हो हो! क्या बैलेंस बनाया है बॉस!",
            "अरे बाल-बाल बचा! पत्थरों का खेल चालू है!",
            "वाह! क्या शानदार छलांग लगाई है!"
        ],
        steppingStonesFall: [
            "ऐ गया काम से! सीधे कीचड़ में छपाक!",
            "अरे रे रे! पानी ठंडा था या गरम बॉस?",
            "गया डक में! ताकेशी के सिपाही तालियां बजा रहे हैं!"
        ],
        mazeGuardAlert: [
            "अरे सावधान! ली के खूंखार सिपाही आसपास ही घूम रहे हैं!",
            "पीछे मुड़ के देखो भाई! ब्लैक पेंट लेके आ रहे हैं!"
        ],
        mazeCaught: [
            "पकड़ा गया! मुंह पे लगा दिया काला पेंट!",
            "अरे यार! दरवाजा गलत चुन लिया भाई!"
        ],
        wipeoutHit: [
            "ढिशुम! सीधे उड़ा दिया गेंद ने!",
            "अरे बाप रे! क्या रोलर का थप्पड़ पड़ा है!"
        ],
        wipeoutDuck: [
            "वाह! क्या झुक के बचा है! एकदम मैट्रिक्स स्टाइल!",
            "बढ़िया टाइमिंग बॉस! सिर बचा लिया!"
        ],
        mushroomMiss: [
            "अरे निशाना चूक गया! सीधे पानी के अंदर!",
            "हाहाहा! मशरूम ने गिरा दिया नीचे!"
        ],
        mushroomHit: [
            "क्या सटीक ड्रॉप! सीधा पैड पे लैंडिंग!",
            "परफेक्ट टाइमिंग भाई! वाह क्या बात है!"
        ],
        finalAssaultShoot: [
            "धांय धांय! ले ताकेशी के टैंक पे वाटर कैनन!",
            "निशाना एकदम सटीक! रिंग फटने वाली है!"
        ],
        finalAssaultHit: [
            "अरे यार! ताकेशी के सिपाहियों ने हमारा निशाना उड़ा दिया!",
            "सावधान! रिंग बचाओ भाई!"
        ],
        stageClear: [
            "शाबाश मेरे शेर! ताकेशी का यह पड़ाव फतह!",
            "क्या बात है बॉस! अगला स्टेज इंतज़ार कर रहा है!"
        ],
        gameOver: [
            "अरे रे रे! सारे खिलाड़ी पानी में बह गए!",
            "ताकेशी किले के जनरल ली की जीत हुई!"
        ],
        gameVictory: [
            "इतिहास रच दिया दोस्तों! ताकेशी के किले पर हमारा कब्ज़ा!",
            "वाह भाई वाह! आप बने ताकेशी किले के असली चैंपियन!"
        ]
    },

    en: {
        stageStart: [
            "Welcome to Takeshi's Castle! Here comes our brave contestant!",
            "Let's see if anyone can conquer General Lee's wild domain today!"
        ],
        steppingStonesFall: [
            "Down into the muddy water! What a splash!",
            "He's taken a bath in General Lee's muddy pool!"
        ],
        steppingStonesNearMiss: [
            "What balance! Saved by the tip of his toes!"
        ],
        mazeCaught: [
            "Caught red-handed—or black-faced! Elimination!"
        ],
        wipeoutHit: [
            "Wiped out by the giant foam log! Right into the moat!"
        ],
        wipeoutDuck: [
            "Duck and roll! Great agility right there!"
        ],
        stageClear: [
            "Magnificent performance! Stage successfully conquered!"
        ],
        gameOver: [
            "Game Over! Takeshi's guards remain victorious today!"
        ],
        gameVictory: [
            "UNBELIEVABLE! Takeshi's Castle has been COMPLETED!"
        ]
    }
};

class CommentaryManager {
    constructor() {
        this.lang = 'hi'; // 'hi' or 'en'
        this.bubbleElem = document.getElementById('commentary-bubble');
        this.textElem = document.getElementById('commentary-text');
        this.hideTimer = null;
    }

    setLanguage(lang) {
        this.lang = lang;
    }

    trigger(eventKey) {
        const pool = COMMENTARY_DATABASE[this.lang]?.[eventKey] || COMMENTARY_DATABASE['hi'][eventKey];
        if (!pool || pool.length === 0) return;

        const line = pool[Math.floor(Math.random() * pool.length)];

        // Display speech bubble
        if (this.bubbleElem && this.textElem) {
            this.textElem.innerText = line;
            this.bubbleElem.classList.remove('hidden');

            if (this.hideTimer) clearTimeout(this.hideTimer);
            this.hideTimer = setTimeout(() => {
                this.bubbleElem.classList.add('hidden');
            }, 3500);
        }

        // Voice speech
        gameAudio.speakCommentary(line);
    }
}

const commentary = new CommentaryManager();
