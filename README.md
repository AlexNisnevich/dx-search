# Diagnosis search

## Organization

**DxSearch** is a React JS app created with [`create-react-app`](https://github.com/facebookincubator/create-react-app) boilerplate. The code is organized as follows:

- [`src/App.js`](https://github.com/AlexNisnevich/dx-search/blob/master/src/App.js) – Main entry point for the application.
- [`src/components/DiagnosisSearch.js`](https://github.com/AlexNisnevich/dx-search/blob/master/src/components/DiagnosisSearch.js) – Search component, which handles user input and calls the `search()` method exported from `util/search.js` to get the list of terms to display.
- [`src/data/diagnoses.js`](https://github.com/AlexNisnevich/dx-search/blob/master/data/diagnoses.js) - Raw diagnosis strings provided in the email.
- [`src/util/diagnoses.js`](https://github.com/AlexNisnevich/dx-search/blob/master/util/diagnoses.js) – Diagnoses pre-processing logic.
- [`src/util/search.js`](https://github.com/AlexNisnevich/dx-search/blob/master/util/search.js) - Search logic, wrapped in a `SearchQuery` class.
- [`src/util/similarity.js`](https://github.com/AlexNisnevich/dx-search/blob/master/util/similarity.js) – String similarity logic.

## Evaluation criteria

To determine the best results for a given query, I work from the bottom up:

### Scoring word<->word similarity

To score the similarity between two words (a word in the query and a word in a diagnosis), I use two different similarity criteria and take the max of the them.

The `substringSimilarity` metric simply checks to see if the `queryWord` is a substring of the `dxWord`. If it is, the score is the ratio of their lengths. For example, `substringSimilarity("cancer", "can") = 3/6`. This is a particularly useful metric when a user has partially typed in a word.

The `editDistanceSimilarity` metric computes the Levenshtein edit distance between the words (using the [`fast-levenshtein`](https://github.com/hiddentao/fast-levenshtein) library). The score given is _(1 – 2*(edit distance)/(length of `dxWord`) )_ or 0, whichever is greater. For example, `substringSimilarity("cancer", "cancr") = 4/6`. This is a particularly useful metric when a user has slightly misspelled a word.

### Scoring terms

Each term within a diagnosis (for example, the diagnosis _"chronic fatigue syndrome (CFS)"_ has two constituent terms: _"chronic fatigue syndrome"_ and _"CFS"_) is scored as follows:

First, the term is broken up into words. Each word within the term has its similarity evaluated against each word in the query, and the max of these is taken to be the score of the word. Then the score of the term is simply the average (arithmetic mean) of the scores of its terms.

Comparing each word in each diagnosis against each word in the query is not the most efficient approach, but it's the best way I could think of to gracefully handle multi-word queries where some words may or may not be relevant, without making the code too complex.

### Scoring diagnoses

In general, the score given to a diagnosis is the max of the score of its constituent terms. All diagnoses with a score > 0 are returned, in order of decreasing score.

However, there are two special cases:
- If the query consists of a single letter, then rather than computing scores for diagnoses, I simply return all diagnoses that contain a word that starts with that letter (in alphabetical order).
- If there are any "exact matches" for the query – that is, diagnoses that either are identical to the query or contain a word that is identical to the query – then only exact matches are returned.

My reasoning for the single-letter case is that it would be hepful for the user to see possible hints when they just start typing in a word, even if neither word similarity metric can produce any reasonable results with this little input. My reasoning for the exact-matches case is that, for example, if a user types in "cancer", it would not be particularly helpful to see fuzzy matches of the word "cancer", since it's clear that this is the word the user meant to type.

## Design decisions

Many design decisions had to be made in the course of building `dx-search`:

- **Front-end or back-end?** I at first envisioned creating a JSON endpoint that handled the search, perhaps written in Ruby or Python. I ultimately opted to perform the search entirely client-side in order to make the user experience as seamless as possible. By keeping everything client-side, there's no delay from making API requests. This is possible because the provided dataset is so small that there's really no problem in offloading the storage and computation to the client. If there were, say, 100,000 diagnoses to search rather than 100, then it may make sense to move the search logic to the server.
- **Choice of tech stack.** Now that I was committed to performing the search entirely client-side in JavaScript, using React offered two clear benefits: organization and performance. The React Component model made it easy to separate UI/UX code from logic code. And React's built-in DOM reconciliation functionality made DOM updates as fast and visually seamless as possible. One drawback was the baggage that comes with React (Babel, webpack, etc) that can make it non-trivial to start a React project from scratch, but fortunately [`create-react-app`](https://github.com/facebookincubator/create-react-app) made the whole process painless (even Heroku integration is streamlined).
- **To pre-process or not to pre-process?** At first my gut instinct was that pre-processing the dataset was unnecessary due to its tiny size. When I found myself repeatedly writing the same code to extract "terms" from diagnoses, it made sense to do a tiny bit of pre-processing in `util/diagnoses.js`, not really for performance's sake so much as to make the search code cleaner.
- **How to score results.** As you can see in the **Evaluation criteria** section above, my scoring methodology can be rather complicated. It was initially much simpler (my first iteration only used a simplified `substringSimilarity` metric with no special cases), but as I tested the app I could come up with different use cases that would require different behavior. Realizing that users could misspell a term made me look into edit distance as an alternative metric. When I considered the fact that a user could type in a compound word that doesn't exist _(e.g. "bone cancer")_ and would still probably want to see some related terms, I re-did how multi-word queries were handled. And so on. As a result, a few different use cases are handled reasonably well, at the cost of code that is not quite as brief and clear as it was at the beginning.
- **Performance vs usefulness.** Tying to the above is the tradeoff between computational efficiency and usefulness of results returned. While the `substringSimilarity` method is essentially free, `editDistanceSimilarity` is more computationally demanding, and this could add up if the dictionary of diagnoses is large. I tried to minimize the risk of slowness by using the fastest Levenshtein library I could find and by memoizing the edit distance calculations on individual pairs of words, and I haven't felt any lag with the current set of 102 diagnoses. However, it seems that this approach would not scale at all if much larger sets of diagnoses are used – in that case, we wouldn't have the time to run Levenstein against every single term, and would have to do something less naive. 
- **Visual organization.** In terms of visual presentation, my first approach had two components: a search input field at the top of the page and a grid of results underneath. [(Here's what it looked like.)](https://i.imgur.com/TEz98vq.png) However, I realized that this design wouldn't really make sense in context, since ultimately the diagnosis search widget would probably be part of a larger form and thus would need to be fairly small and self-contained visually. Thus, I refactored it into the auto-completed text field that it is now.

## Further work

**DxSearch** as written seems to work reasonably well for now, but, as mentioned above, my approach is certainly not scalable to larger sets of diagnoses.

If, rather than 100 diagnoses, we were dealing with 1,000 or 10,000, the Levenshtein distance calculation would quickly become a performance bottleneck. Even if `fast-levenshtein` can do 1,800 calculations a second, waiting 5 seconds for results to come in is unacceptable. I would have to either get rid of `editDistanceSimilarity` completely or come up with some method to reduce the number of computations to perform (for example, we could only consider words that start with the same letter as each other, or even limit it to words with the same first two letters). This shouldn't affect users too much, since typos in practice seem to be rare at the start of words.

If we had to deal with even more diagnoses than this, say, 100,000, it would start to make sense to move the search logic out of the client-side completely. At this point I would consider using an existing search solution such as Elasticsearch and Algolia, to ensure the most performant user experience possible.

Fortunately, these changes can all be done without changing the `DiagnosisSearch` component at all, making the user experience consistent regardless of search backend choice.

If I had just one week to create a search widget that could handle 100,000 diagnoses, I would opt to transition to an external full-text-search service, as mentioned above.

If I had a month or more, though, I would instead consider creating my own performant search backend. The advantage of a DIY approach is that I could implement diagnosis-specific search rules that a context-agnostic service like Elasticsearch wouldn't be aware of. For example, something interesting could be done with hierarchical organizations of diagnoses such as ICD-9: users that are entering a very general diagnosis, for example, could have more specific sub-diagnoses appeach as suggestions.
