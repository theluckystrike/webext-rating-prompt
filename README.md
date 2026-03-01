# webext-rating-prompt — Smart Rating Requests
> **Built by [Zovo](https://zovo.one)** | `npm i webext-rating-prompt`

Usage-based triggering, styled CWS review UI, and smart suppression after dismiss or rate.

```typescript
import { RatingPrompt } from 'webext-rating-prompt';
const rating = new RatingPrompt();
await rating.trackUse();
if (await rating.shouldShow(10, 3)) rating.show('container');
```
MIT License
