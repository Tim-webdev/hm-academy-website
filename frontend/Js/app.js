document.addEventListener('DOMContentLoaded', () => {
  // Example: populate course-list, handle login form, simulate stats
  const courseList = document.getElementById('course-list');
  const courses = [
    {id:1, title: 'Web Development', price: '₦50,000', duration: '3 months'},
    {id:2, title: 'Graphic Design', price: '₦40,000', duration: '2 months'}
  ];
  if (courseList) {
    courses.forEach(c => {
      const card = document.createElement('div');
      card.className = 'course-card';
      card.innerHTML = `<h3>${c.title}</h3>
        <p>Price: ${c.price}</p>
        <p>Duration: ${c.duration}</p>
        <a href="course-detail.html?courseId=${c.id}">View Details</a>`;
      courseList.appendChild(card);
    });
  }
});