import AssetIterator from "./AssetIterator.js";


test('Test Asset Iterator', () => {
    const iterator = new AssetIterator(assets);
    const stats = iterator.getAssetStats();
    console.log('stats', stats)
});

const assets = {
    "dirs": {
        "chronology": {
            "files": [
                "fomenko_books.md",
                "fomenko_new_chronology.jpg",
                "fomenko_new_chronology.md",
                "fomenko_timeline.gif",
                "fomenko_timeline.md",
                "gutenberg_bible_1455.jpg",
                "gutenberg_bible_1455.md",
                "history.png",
                "history_fake.jpg",
                "index.md",
                "islam_in_early_america.jpg",
                "lunar_calendar.jpg",
                "phantom_time_hypothesis.jpg",
                "phantom_time_hypothesis.mp4",
                "phantom_time_hypothesis2.jpg",
                "phantom_time_hypothesis3.jpg",
                "phantom_time_hypothesis4.jpg",
                "plagues_of_venus.jpg",
                "PP_The_Master_2012_History_Redacted.mp4",
                "redacted.jpg"
            ],
        }
    }
}