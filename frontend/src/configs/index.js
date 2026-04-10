const modules = import.meta.glob('./games/*.json', { eager: true });

const gamesConfig = Object.keys(modules).reduce((acc, path) => {
  const gameKey = path.split('/').pop().replace('.json', '');
  // Vite's eager JSON imports default export the JSON object
  acc[gameKey] = modules[path].default || modules[path];
  return acc;
}, {});

export default gamesConfig;
