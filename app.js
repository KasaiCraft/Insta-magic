document.addEventListener('DOMContentLoaded', () => {
    // --- Lottie Animation Loading ---
    async function loadLottieAnimation(elementId, jsonPath) {
        const player = document.getElementById(elementId);
        if (player) {
            try {
                const response = await fetch(jsonPath);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const animationData = await response.json();
                player.load(animationData); // Use .load() with JSON object directly
            } catch (error) {
                console.error(`Error loading Lottie animation from ${jsonPath}:`, error);
                // Optionally, display a fallback image or message
                if (player.parentNode) {
                    const fallbackImg = document.createElement('img');
                    fallbackImg.src = './placeholder-icon.png'; // A simple fallback image
                    fallbackImg.alt = `Icon for ${elementId}`;
                    fallbackImg.style.width = '100px';
                    fallbackImg.style.height = '100px';
                    player.parentNode.replaceChild(fallbackImg, player);
                }
            }
        }
    }

    loadLottieAnimation('lottieAICaptions', 'ai_captions_icon.json');
    loadLottieAnimation('lottieHashtagGenius', 'hashtag_genius_icon.json');
    loadLottieAnimation('lottieSmartScheduler', 'smart_scheduler_icon.json');
    loadLottieAnimation('lottieAnalyticsDashboard', 'analytics_dashboard_icon.json');

    // --- Typing Animation for Hero Section ---
    const typingTextElement = document.getElementById('typing-text');
    const phrases = [
        "200K+ captions generated today!",
        "Trending hashtags updated hourly",
        "Millions of posts optimized!",
        "Engagement rates soaring high!"
    ];
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function typeEffect() {
        const currentPhrase = phrases[phraseIndex];
        let displayText = '';

        if (isDeleting) {
            displayText = currentPhrase.substring(0, charIndex - 1);
        } else {
            displayText = currentPhrase.substring(0, charIndex + 1);
        }

        typingTextElement.textContent = displayText;

        let typingSpeed = 100; // Speed of typing
        if (isDeleting) {
            typingSpeed /= 2; // Faster deleting
        }

        if (!isDeleting && charIndex === currentPhrase.length) {
            // Pause at end of phrase
            typingSpeed = 1500;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            typingSpeed = 500; // Pause before typing next phrase
        }

        if (isDeleting) {
            charIndex--;
        } else {
            charIndex++;
        }

        setTimeout(typeEffect, typingSpeed);
    }

    typeEffect(); // Start the typing animation

    // --- "Try It" buttons (scroll to caption generator) ---
    const tryItButtons = document.querySelectorAll('.try-it-btn');
    tryItButtons.forEach(button => {
        button.addEventListener('click', () => {
            const feature = button.dataset.feature;
            // Both caption and hashtag features use the same generator section
            if (feature === 'caption' || feature === 'hashtag') {
                document.getElementById('captionGeneratorSection').scrollIntoView({ behavior: 'smooth' });
            } else {
                // This 'else' block will now only be hit if a new, unhandled feature is added
                alert('This feature is coming soon in the full InstaCraft AI app!');
            }
        });
    });

    // --- Caption Generator Logic ---
    const photoDescriptionInput = document.getElementById('photoDescription');
    const isBusinessCheckbox = document.getElementById('isBusinessCheckbox');
    const businessHandleInput = document.getElementById('businessHandleInput');
    const generateBtn = document.getElementById('generateBtn');
    const loadingMessage = document.getElementById('loadingMessage');
    const outputSection = document.getElementById('outputSection');
    const captionsOutput = document.getElementById('captionsOutput');
    const hashtagsOutput = document.getElementById('hashtagsOutput');
    const copyAllBtn = document.getElementById('copyAllBtn');
    const copyFeedback = document.getElementById('copyFeedback');

    // Toggle business handle input visibility
    isBusinessCheckbox.addEventListener('change', () => {
        businessHandleInput.classList.toggle('hidden', !isBusinessCheckbox.checked);
        if (!isBusinessCheckbox.checked) {
            businessHandleInput.value = ''; // Clear input if unchecked
        }
    });

    // Generate captions and hashtags
    generateBtn.addEventListener('click', async () => {
        const photoDescription = photoDescriptionInput.value.trim();
        const selectedStyle = document.querySelector('input[name="captionStyle"]:checked').value;
        const isBusiness = isBusinessCheckbox.checked;
        const businessHandle = businessHandleInput.value.trim();

        if (!photoDescription) {
            alert('Please describe your photo.');
            return;
        }

        // Show loading state
        generateBtn.disabled = true;
        loadingMessage.classList.remove('hidden');
        outputSection.classList.add('hidden'); // Hide previous output
        captionsOutput.innerHTML = '<p class="feedback-message">Select a caption to copy.</p>';
        hashtagsOutput.innerHTML = '';
        copyFeedback.classList.add('hidden');

        try {
            const systemPrompt = `Act as a viral Instagram marketing expert. Generate 3 engaging caption options and 20 targeted hashtags based on the user's photo description and preferences.
            
Respond directly with JSON, following this JSON schema, and no other text.
{
  "captions": [
    {
      "style": "Trendy" | "Funny" | "Minimal",
      "text": "string"
    },
    // ... two more caption objects
  ],
  "hashtags": {
    "popular": ["string", "string", "string", "string", "string"], // 5 popular, under 500k posts
    "niche": ["string", "string", "string", "string", "string"], // 5 niche, relevant to content
    "location_based": ["string", "string", "string", "string", "string"], // 5 location-based if applicable, otherwise general, under 500k posts
    "branded": ["string", "string", "string", "string", "string"] // 5 branded (using business handle), or relevant if no handle, under 500k posts
  }
}

Caption Rules:
- "Trendy" captions: Curiosity hooks ("POV:...") or relatable stories, 1-2 lines with 2-3 emojis, conversational.
- "Funny" captions: Witty/pun-based, under 150 chars.
- "Minimal" captions: Visually descriptive, 3-5 words, aesthetic vibe.

Hashtag Rules:
- Total 20 hashtags.
- All hashtags must be under 500k posts for better reach.
- Never use banned hashtags (e.g., #LikeForLike, #FollowForFollow).
- Auto-remove duplicates.
- Ensure all generated hashtags start with '#'.
- For 'branded' hashtags, if a business handle is provided, ensure they are related to the business and include the handle in some form if possible (e.g., #YourBusinessTips). If no business handle, generate 5 more niche/relevant hashtags.
- For businesses: If applicable to the prompt, include 1 clear Call-to-Action (CTA) in one of the captions (e.g., "DM for pricing!").

Example for your reference (do not mimic style directly unless requested):
Input: "Matcha latte art at my café"
Output (JSON):
{
  "captions": [
    {
      "style": "Trendy",
      "text": "POV: Your morning just got a whole lot greener and prettier. 🍵✨ Who else needs this vibe today?"
    },
    {
      "style": "Funny",
      "text": "My barista is an artist, and my wallet is crying. 😅 'Matcha' made in heaven!"
    },
    {
      "style": "Minimal",
      "text": "Green tea dreams. 🍃"
    }
  ],
  "hashtags": {
    "popular": ["#MatchaLove", "#LatteArt", "#CoffeeGram", "#InstaFood", "#CafeVibes"],
    "niche": ["#MatchaLatteArt", "#BaristaLife", "#SpecialtyCoffee", "#GreenTeaLovers", "#LocalCafe"],
    "location_based": ["#CityCoffee", "#UrbanEats", "#MyCityFood", "#LocalSpot", "#HiddenGem"],
    "branded": ["#MyCafeName", "#CafeMatcha", "#CoffeeCulture", "#DailyBrew", "#TasteMyCafe"]
  }
}
`;

            const userMessageContent = [{
                type: "text",
                text: `Photo Description: "${photoDescription}"\nPreferred Caption Style: "${selectedStyle}"`
            }];

            if (isBusiness && businessHandle) {
                userMessageContent[0].text += `\nBusiness Handle: "${businessHandle}"`;
            } else if (isBusiness && !businessHandle) {
                 userMessageContent[0].text += `\nUser is a business but no handle provided.`;
            }

            const completion = await websim.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: systemPrompt,
                    },
                    {
                        role: "user",
                        content: userMessageContent,
                    },
                ],
                json: true,
            });

            const result = JSON.parse(completion.content);
            displayResults(result);

        } catch (error) {
            console.error('Error generating content:', error);
            alert('Failed to generate content. Please try again later.');
        } finally {
            generateBtn.disabled = false;
            loadingMessage.classList.add('hidden');
        }
    });

    function displayResults(data) {
        // Display Captions
        captionsOutput.innerHTML = '';
        data.captions.forEach((caption, index) => {
            const captionId = `captionOption${index}`;
            const div = document.createElement('div');
            div.classList.add('caption-option');
            div.innerHTML = `
                <input type="radio" id="${captionId}" name="selectedCaption" value="${caption.text}" ${index === 0 ? 'checked' : ''}>
                <label for="${captionId}">
                    <p class="caption-label">${caption.style} Caption:</p>
                    <p class="caption-text">${caption.text}</p>
                </label>
            `;
            captionsOutput.appendChild(div);
        });

        // Display Hashtags
        hashtagsOutput.innerHTML = '';
        let allHashtags = [];
        for (const category in data.hashtags) {
            const hashtags = data.hashtags[category];
            // Filter out empty or non-string hashtags and remove duplicates
            const filteredHashtags = hashtags.filter(tag => typeof tag === 'string' && tag.trim() !== '' && tag.startsWith('#'))
                                             .map(tag => tag.trim());
            allHashtags = allHashtags.concat(filteredHashtags);
            
            // Display categorized hashtags
            if (filteredHashtags.length > 0) {
                const p = document.createElement('p');
                p.innerHTML = `<b>${category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</b> ${filteredHashtags.join(' ')}`;
                hashtagsOutput.appendChild(p);
            }
        }
        
        // Remove duplicates and format for copying
        allHashtags = [...new Set(allHashtags)];
        const allHashtagsString = allHashtags.join(' ');

        // Add a hidden paragraph for easy copy of all hashtags
        const hiddenHashtagsP = document.createElement('p');
        hiddenHashtagsP.id = 'allHashtagsFormatted';
        hiddenHashtagsP.classList.add('hidden');
        hiddenHashtagsP.textContent = allHashtagsString;
        hashtagsOutput.appendChild(hiddenHashtagsP);

        outputSection.classList.remove('hidden');
    }

    // Copy functionality
    copyAllBtn.addEventListener('click', async () => {
        const selectedCaption = document.querySelector('input[name="selectedCaption"]:checked');
        const allHashtagsFormatted = document.getElementById('allHashtagsFormatted');

        if (!selectedCaption) {
            alert('Please select a caption first.');
            return;
        }

        const captionText = selectedCaption.value;
        const hashtagsText = allHashtagsFormatted ? allHashtagsFormatted.textContent : '';

        const textToCopy = `${captionText}\n\n${hashtagsText}`;

        try {
            await navigator.clipboard.writeText(textToCopy);
            copyFeedback.textContent = 'Copied to clipboard!';
            copyFeedback.classList.remove('hidden');
            setTimeout(() => {
                copyFeedback.classList.add('hidden');
            }, 3000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
            copyFeedback.textContent = 'Failed to copy. Please try manually.';
            copyFeedback.style.color = 'red';
            copyFeedback.classList.remove('hidden');
        }
    });
});