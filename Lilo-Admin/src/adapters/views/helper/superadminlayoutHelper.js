const getLayoutForPath = (path) => {
    switch (path) {
        case "/home":
            return 'complist';
        case "/subs":
            return 'subs';
        case "/reports":
            return 'reports';
        case "/settings":
            return 'settings';
        default:
            return 'blank';
    }
};

module.exports = getLayoutForPath;
