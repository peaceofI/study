import { getFlashcards, updateFlashcard } from '../storage/database.js';

export function initSpacedRepetition() {
    setInterval(checkDueCards, 3600000);
}

export function checkDueCards() {
    const due = getDueFlashcards();
    if (due.length > 0) {
        console.log(`${due.length} flashcards due for review`);
    }
}

export function processReview(card, quality) {
    let { ease, interval, repetitions } = card;
    
    if (quality >= 2) {
        if (repetitions === 0) interval = 1;
        else if (repetitions === 1) interval = 6;
        else interval = Math.round(interval * ease);
        repetitions++;
    } else {
        repetitions = 0;
        interval = 1;
    }
    
    ease = Math.max(1.3, ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
    
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + interval);
    
    updateFlashcard(card.id, {
        ease,
        interval,
        repetitions,
        nextReview: nextReview.toISOString()
    });
}

export function getDueFlashcards() {
    return getFlashcards().filter(c => new Date(c.nextReview) <= new Date());
}
