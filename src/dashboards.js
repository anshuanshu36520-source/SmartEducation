async function renderDashboards() {
  const studentBox = document.getElementById('studentOverview');
  const teacherBox = document.getElementById('teacherOverview');
  const lessons = await dbGetLessons('', getCurrentDisease());
  const profile = await dbGetProfile();
  const adaptive = await getAdaptiveNextSteps();
  const recent = lessons.slice(0,5).map(l=>`• ${l.title}`).join('\n') || 'No lessons yet.';
  studentBox.textContent = `XP: ${profile.xp}\nBadges: ${(profile.badges||[]).join(', ')||'-'}\nRecent Lessons:\n${recent}`;
  document.getElementById('adaptiveNext').textContent = 'Next Steps:\n' + adaptive.map(x=>'• '+x).join('\n');
  const stats = `Total Lessons (${getCurrentDisease()}): ${lessons.length}\nTop Language: ${(lessons[0]?.language)||'en-IN'}`;
  teacherBox.textContent = stats;
}

document.addEventListener('visibilitychange', () => {
  if (!document.hidden && document.getElementById('dashboards').classList.contains('active')) {
    renderDashboards();
  }
});


