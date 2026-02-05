const mockMembers = [
  {
    name: "Ana Gómez",
    title: "Marketing Manager",
    company: "Acme Corp",
    reaction: "Like"
  },
  {
    name: "David Ruiz",
    title: "Growth Lead",
    company: "FinTech Labs",
    reaction: "Celebrate"
  }
];

const LinkedInPostActivity = () => (
  <div>
    <h4>Post Activity</h4>
    <ul>
      {mockMembers.map((m, i) => (
        <li key={i}>
          <strong>{m.name}</strong> – {m.title} at {m.company} ({m.reaction})
        </li>
      ))}
    </ul>
  </div>
);

export default LinkedInPostActivity;
