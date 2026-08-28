# Demo sandbox

Open `/demo/` or `/?demo=1` to load three sample recipes: Weeknight lemon pasta, Roasted tomato soup, and Sunday apple crisp. They include ingredients, steps, notes, source URLs, attribution, and one sample image.

The persistent banner says “Demo — sample data, nothing is saved.” **Reset demo** clears and reseeds the sample workspace. **Start for real** clears that workspace and returns to the empty converter.

Demo edits use the IndexedDB database named `demo:recipe-exit-pack`. Demo mode does not open the real `recipe-exit-pack` workbench database or the license localStorage keys. The demo is shipped in the service-worker app shell, so it remains usable after the first successful visit while offline.
