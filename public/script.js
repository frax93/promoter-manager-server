// public/script.js
document.addEventListener('DOMContentLoaded', function() {
    const calendarEl = document.getElementById('calendar');
    const calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: "dayGridMonth",
      selectable: true,
      events: "/events",
      dateClick: function (info) {
        const title = prompt("Inserisci il titolo dell'evento:");
        if (title) {
          fetch("/events", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              title: title,
              start: info.dateStr,
              end: info.dateStr,
            }),
          })
            .then((response) => response.json())
            .then((event) => {
              calendar.addEvent(event);
            });
        }
      },
    });
    
    calendar.render();
});
