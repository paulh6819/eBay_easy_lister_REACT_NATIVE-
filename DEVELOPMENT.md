# Development Workflow

## Hot Reload Setup

This project now has hot reload configured for both the React Native app and Node.js server.

### Available Scripts

#### Development (Recommended)
```bash
# Start both server and React Native with hot reload
npm run dev

# Start both server and iOS simulator with hot reload
npm run dev:ios

# Start both server and Android emulator with hot reload
npm run dev:android
```

#### Individual Components
```bash
# Start only the server with hot reload
npm run server:dev

# Start only React Native (Expo)
npm start

# Start React Native for iOS
npm run ios

# Start React Native for Android
npm run android
```

#### Production
```bash
# Start server without hot reload
npm run server
```

### What Gets Reloaded

#### Server Hot Reload (nodemon)
- `new-server.js` - Main server file
- `src/services/` - All service files (eBay API, listing services, etc.)
- `.env` - Environment variables
- Ignores `node_modules/` and test files

#### React Native Hot Reload (Expo)
- All React Native components automatically reload when saved
- Fast Refresh preserves component state during development

### Development Tips

1. **Use `npm run dev`** for full development - starts both server and app
2. **File changes are automatically detected** - no manual restarts needed
3. **Server restarts in ~1 second** when backend files change
4. **React Native components update instantly** with Fast Refresh
5. **Environment variable changes** also trigger server restart

### Debugging

- Server logs appear in the terminal with `[server]` prefix
- React Native logs appear with `[react-native]` prefix  
- Both run concurrently in the same terminal session

Stop both with `Ctrl+C` - it will terminate both processes.