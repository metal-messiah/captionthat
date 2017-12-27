/**
 * Created by Porter on 12/24/2017.
 */
let captions = [
    "When you're about to leave work and the boss says 'before you go'",
    "When you just wanna text and the person decides to call you",
    "When you're trying not to cough because you don't want people to think you have ebola",
    "When you haven't told anyone you're vegan in the last five minutes",
    "When you're finally home alone and can be yourself",
    "When you see your ex with the same person they told you not to worry about",
    "When you fart and only the person next to you hears it",
    "When you do crossfit and haven't told anyone in 8 minutes",
    "When you open your Christmas present and it's a pair of socks",
    "When you complete 1 of the 30 things on your to-do list",
    "When you're on the verge of a breakdown but you're trying to stay positive",
    "When you really have to poop but someone keeps talking to you",
    "When you see a spider at the bottom of the tub so you turn on the water to watch it drown",
    "When you're in an argument but run out of comebacks",
    "When you try to take a photo but it's set to the front camera",
    "When you go for an oil change and find out you have 17 other problems and your car has two months to live",
    "When you hear someone open a bag of chips",
    "When you show someone a new song and they talk through the whole thing",
    "When you walk into church late and they pause the prayer until you sit down",
    "When you remember that one time he lied 4 months ago",
    "When you can feel yourself starting to fall for someone",
    "When you go to pet a dog and it growls at you",
    "When you ate the last of something and you hear them in the kitchen looking for it",
    "When you say 'leave me alone' and he replies with 'okay bye'",
    "When you call shotgun but end up in the back seat",
    "When you stand next to your crush and someone says 'yall should date' and your crush says 'ew'",
    "When you find out that someone hates the same person as you",
    "When you're trying to cheat on a test and you make eye contact with your teacher",
    "When it's 1am and your dog starts barking at nothing",
    "When you flip the pillow over to the cold side",
    "When you look at your boyfriend after watching The Notebook and realize he's not Ryan Gosling",
    "When you're at a friend's house and they start having family problems",
    "When YOU win the lottery and she keeps saying 'WE' won",
    "When you go to click 'next episode' and realize you just finished the series",
    "When you pull up to work and the building still standing",
    "When your alarm doesn't go off and you don't have time to get ready",
    "When you get up for a second plate and someone says 'thought you were dieting...'",
    "When a teacher keeps talking after the bell rings",
    "When a manager asks if you'd like to leave early",
    "When you take your bra off after a long day",
    "When someone adds another plate to the sink while you're washing the dishes",
    "When you find out that girls poop",
    "When you rap the whole verse correctly",
    "When you're arguing with someone and Google decides you're right",
    "When your lasagna sounds like WWII in the microwave but comes out cold",
    "When your grandpa asks if your ripped jeans came like that",
    "When the flight attendant wakes you up to offer you a bag of stale peanuts",
    "When your black friend calls you the n-word for the first time",
    "When your parents say you spend too much time on your phone",
    "When the light turned green 0.1 seconds ago and the guy behind you is already beeping",
    "When you're hanging out with a couple and they start fighting",
    "When you realize you just watched Kylie Jenner make a pancake on Snapchat for 15 minutes",
    "When you see a comma in your bank account",
    "When you hear someone say 'moist'",
    "When someone tells you to stop using the word 'literally' but you literally can't",
    "When you go trick-or-treating and they give you raisins",
    "When you check Facebook and see your grandson wearing that sweater you knitted him, but the tag is 'Ugly Sweater Party'",
    "When your ex sends you an invitation to connect on LinkedIn",
    "When you introduce two of your friends and they start hanging out without you",
    "When you lay down for a powernap and wake up 8 hours later and don't know who you are anymore",
    "When your shampoo says damage repair but you're still broken inside",
    "When you're watching a movie with your parents and there's a sex scene",
    "When you get a Snapchat notification but it's from 'Team Snapchat'",
    "When your grandma gives you a birthday card but no money falls out when you open it",
    "When you're taking a poop but forgot to bring your phone",
    "When your meeting is almost over and someone asks a question that extends it 20 minutes",
    "When you go with almond milk instead of regular milk",
    "When you forgot to turn on your wifi and realize you just used all your data in the first week",

]

let usedCaptions = [];

let draw = () => {
    if (captions.length) {
        let randomCard = captions.splice(Math.floor(Math.random() * (captions.length - 1 - 0 + 1) + 0), 1)[0];
        usedCaptions.push(randomCard);
        return {randomCard, captions, usedCaptions};
    }
    else {
        captions = usedCaptions.slice();
        usedCaptions = [];
        let randomCard = captions.splice(Math.floor(Math.random() * (captions.length - 1 - 0 + 1) + 0), 1)[0];
        usedCaptions.push(randomCard);
        return {randomCard, captions, usedCaptions};
    }
};

let startingHand = () => {
    return [draw().randomCard, draw().randomCard, draw().randomCard, draw().randomCard];
}

module.exports = {
    captions: captions,
    usedCaptions: usedCaptions,
    draw: draw,
    startingHand: startingHand
}