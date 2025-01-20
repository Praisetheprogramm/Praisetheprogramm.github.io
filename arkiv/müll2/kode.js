document.addEventListener('DOMContentLoaded', () => {
    const muellList = [
        'Restmüll: Nicht recycelbare Abfälle',
        'Biomüll: Organische Abfälle',
        'Papiermüll: Altpapier und Kartons',
        'Verpackungsmüll: Kunststoff und Metallverpackungen',
        'Altglas: Glasflaschen und -behälter',
        'Sperrmüll: Große Gegenstände wie Möbel',
        'Elektroschrott: Alte Elektrogeräte',
        'Problemstoffe: Gefährliche Abfälle wie Batterien'
    ];

    const recyclingList = [
        'Papierrecycling: Verarbeitung von Altpapier zu neuem Papier',
        'Kunststoffrecycling: Verarbeitung von Kunststoffabfällen',
        'Glasrecycling: Verarbeitung von Altglas',
        'Metallrecycling: Verarbeitung von Metallabfällen',
        'Elektronikrecycling: Zerlegung alter Elektrogeräte',
        'Biomüllrecycling: Kompostierung organischer Abfälle',
        'Energetisches Recycling: Verbrennung zur Energiegewinnung'
    ];

    const muellUl = document.getElementById('muell-list');
    const recyclingUl = document.getElementById('recycling-list');

    muellList.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        muellUl.appendChild(li);
    });

    recyclingList.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        recyclingUl.appendChild(li);
    });
});
