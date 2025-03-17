const getLayoutForPath = (path) => {
    switch (path) {
        case "Employees":
            return 'employees-layout';
        case "/dashboard":
            return 'dashboard-layout';
        case "/dtrs":
        case "/start-of-day":
        case "/rejected-logs":
            return 'reports-layout';
        case "/registration":
        case "/mismatch-location":
        case "/logs":
            return 'reviews-layout';

        default:
            return 'blank';
    }
};

module.exports = getLayoutForPath;
