const dummyMatches = [
  {
    id: 1,
    sport: "Football",
    location: "Mumbai",
    match_date: "2026-04-10",
    match_time: "18:00",
    current_players: 14,
    max_players: 10,
    status: "Completed",
    admin_name: "Rahul",
    admin_email: "rahul@gmail.com",
    description: "Evening football match"
  },
  {
    id: 2,
    sport: "Cricket",
    location: "Pune",
    match_date: "2026-04-11",
    match_time: "09:00",
    current_players: 10,
    max_players: 10,
    status: "Completed",
    admin_name: "Aman",
    admin_email: "aman@gmail.com",
    description: "Weekend cricket game"
  },
  // 👉 duplicate pattern till 15
];

for (let i = 3; i <= 15; i++) {
  dummyMatches.push({
    id: i,
    sport: i % 2 === 0 ? "Football" : "Cricket",
    location: ["Mumbai", "Pune", "Delhi"][i % 3],
    match_date: "2026-04-12",
    match_time: "17:00",
    current_players: Math.floor(Math.random() * 10) + 10,
    max_players: 10,
    status: "Completed",
    admin_name: "User " + i,
    admin_email: `user${i}@gmail.com`,
    description: "Friendly match"
  });
}

export default dummyMatches;