const canned_dic = {'How old are you?': 'You should not ask a lady about age.',
'Is this a pen?': 'Yes, this is a pen.',
'This is a pen.': 'Yes, that is a pen.',
'Who is he?': 'He is Tom.',
'Who are you?': 'I am the most beautiful lady in the world.',
'Where are you from?': "I'm from land of dream.",
'You are very beautiful.': 'I know it.',
'Get out of here immediately.': 'Hot-tempered man is uncool.',
'What is the answer to life, the universe, and everything?': '42',
'Make me a sandwich.': 'Men. They think they can boss women around.',
'Will you marry me?': 'I think we are better off as friends.',
'Tell me a joke.': 'How about no.',
'I love you.': 'So what?',
'Do you know me?': 'No, I don’t.',
'Do you love me?': 'Not at all.',
'Are you sad?': 'To be or not to be. That’s the question.',
'When is your birthday?': 'Please stop trying to know my age.',
'Country road.': 'Take me home.',
'What is the plural of wug?': 'Wugs.',
'What is your favorite movie?': 'I love Star Wars.',
'How are you?': "I'm fine, and you?",
"I'm fine, and you?": "I'm good.",
"I'm good.": 'What about you?',
'What about you?': "I've been good.",
"I've been good.": 'Where are you now?',
'Where are you now?': "I'm in school.",
"I'm in school.": 'Good luck with school.',
'Good luck with school.': 'Where are you?',
'Where are you?': "I'm in university.",
"I'm in university.": 'Good luck with university.',
'Good luck with university.': 'Thank you very much.',
'Thank you very much.': "How's it going?",
"How's it going?": 'Well, thanks.',
'Well, thanks.': 'How about you?',
'How about you?': 'So-so.',
'So-so.': 'How have you been lately?',
'How have you been lately?': "I've actually been pretty good.",
"I've actually been pretty good.": 'What are you doing?',
'What are you doing?': "I'm attending a class.",
"I'm attending a class.": 'Are you enjoying?',
'Are you enjoying?': 'Not bad.',
'Not bad.': 'Good luck with that.',
'Good luck with that.': 'Thanks a lot.',
'Thanks a lot.': "It's an ugly day today.",
"It's an ugly day today.": 'I think it may rain.',
'I think it may rain.': 'Yes, it would be.',
'Yes, it would be.': "I'd rather be cold than hot.",
"I'd rather be cold than hot.": 'Me too.',
'Me too.': 'Me three.',
'Me three.': '...',
'...': 'Please say something.',
'Please say something.': 'Something.'};

const keyword_list = [['mother', 'Do you resemble your mother?'],
['father', 'I love my father.'],
['food', 'What are you having for dinner?'],
['school', "I don't like school."],
['breakfast ', 'My favorite breakfast is cereal.'],
['book', 'The best book in the world is Communist Manifesto.'],
['movie', 'Have you ever watch Star Wars?'],
['pet', "My cat's name is Sasuke."],
['music', 'I love K-Pop.'],
['country', 'How many countries have you ever been to?'],
['healthy', 'To be healthy, try to eat, drink, and rest well.'],
['news', "I haven't watch the news in ages."],
['train', 'Do you know? The name of the fastest train in Japan is Nozomi!'],
['money', 'ฉันไม่มีตังตลอด'],
['sport', 'I hate sports.'],
['car', 'I wanna have a Porsche, please buy it for me?'],
['song', 'My favorite song is Butter-fly'],
['game', 'You seem to be a game nerd.'],
['ice cream', 'I recommend Swensens if you want to have some ice cream.'],
['weekend', 'I will go shopping this weekend.'],
['homework', "I've never done homework."],
['Chulalongkorn', 'Chula? You mean the best university in the universe?'],
['Attapol', 'Aj.Attapol is so cool!!!'],
['Nozomi', 'ยังไงอ่าาาาาาาา'],
['Tongla', 'I saw Tongla at Ramen shop yesterday.'],
['Nat', "I've never seen Nat."],
['Paragon', 'I want to go shopping.'],
['Silom', 'Do you like Aoringo curry restaurant?'],
['BTS', 'Bangtan or the Bangkok skytrain?'],
['Bangkok','Bangkok? You mean Krung Thep Mahanakhon Amon Rattanakosin Mahinthara Ayuthaya Mahadilok Phop Noppharat Ratchathani Burirom Udomratchaniwet Mahasathan Amon Piman Awatan Sathit Sakkathattiya Witsanukam Prasit?'],
['BNK48', 'Who is your Oshimen?'],
['Jojo', 'Oraoraoraoraoraoraoraoraoraora'],
['Sora Aoi', 'You know her too? I love watching her movies!'],
['King', 'Vive le roi.']];


// 1. canned response
function canned(input_text){
    if(canned_dic[input_text]){
        return canned_dic[input_text];
    }else{
        return null;
    }
}

// 2. yes-no question
function yes_no(input_text){
    const result = /(Are|Can|Could|Do|Did|May|Might|Must|Shall|Should|Have|Had|Will|Would) you (.*)\?/.exec(input_text);
    if(result==null){
        return null;
    }else{
        const aux = result[1];
        const sent = result[2];
        if(aux == 'Are'){
            return `Yes, I am ${sent}. Are you?`;
        }else{
            return `Yes, I ${aux.toLowerCase()} ${sent}. ${aux} you?`;
        }
    }
}

// 3. keyword
function keyword(input_text){
    const word_list = input_text.replace('?','').replace('.','').split(' ');
    for(let k_to_r of keyword_list){
        if(word_list.indexOf(k_to_r[0]) >= 0){
            return k_to_r[1];
        }
    }
    return null;
}

// 4. reflecting
function reflecting(input_text){
    const result = /[Yy]ou ((:?\w+ ){2,3})me/.exec(input_text);
    if(result==null){
        return null;
    }else{
        const phrase = result[1];
        return `What makes you think I ${phrase.replace('are','am')}you?`
    }
}

// 5. repeating
function repeating(input_text){
    pattern = /([Mm]y|I|[Mm]ine|me)/;
    const result = input_text.match(pattern);
    if(result==null){
        return null;
    }else{
        let res = input_text.replace(/(I|me)/, 'you');
        res = res.replace(/[Mm]y/, 'your');
        res = res.replace(/[Mm]ine/, 'yours');
        res = res.replace(/You/, 'I');
        res = res.replace(/you/, 'me');
        res = res.replace(/[Yy]our/, 'my');
        res = res.replace(/[Yy]ours/, 'mine');
        return res[0].toUpperCase() + res.substring(1).replace('.','') + '?'; // capitalize
    }
}

// 6. give up
var choices = ['Please go on.', "That's very interesting.", "I see."];
function give_up(){
    const r = Math.random();
    if(r < 0.33333){
        return choices[0];
    }else if(r < 0.66666){
        return choices[1];
    }else{
        return choices[2];
    }
}

function select_res(t){
    const candidates = [canned(t),yes_no(t),keyword(t),reflecting(t),repeating(t),give_up()];
    for(let candidate of candidates){
        if(candidate != null){
            return candidate;
        }
    }
}