async function getAdaptiveNextSteps() {
  const profile = await dbGetProfile();
  const lessons = await dbGetLessons('', getCurrentDisease());
  const hasFewLessons = lessons.length < 5;
  const recommendations = [];
  if (hasFewLessons) recommendations.push('Add 3 lessons to build your library');
  if ((profile.xp||0) < 20) recommendations.push('Complete 2 quizzes to reach Learner badge');
  if (!recommendations.length) recommendations.push('Host or join a Live Class to collaborate');
  return recommendations;
}


