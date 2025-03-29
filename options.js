document.addEventListener('DOMContentLoaded', function() {
  // Sample data for medals
  const medals = [
    { name: 'Eco Warrior', image: 'medal1.png' },
    { name: 'Local Supporter', image: 'medal2.png' },
    { name: 'Sustainability Champion', image: 'medal3.png' },
    { name: 'Green Guardian', image: 'medal4.png' },
    { name: 'Carbon Cutter', image: 'medal5.png' },
    { name: 'Eco Innovator', image: 'medal6.png' },
    { name: 'Nature Nurturer', image: 'medal7.png' },
    { name: 'Planet Protector', image: 'medal8.png' },
    { name: 'Resource Rescuer', image: 'medal9.png' },
    { name: 'Waste Warrior', image: 'medal10.png' }
  ];

  // Sample data for product stories
  const stories = [
    { title: 'The Journey of Maple Syrup', image: 'story1.jpg', description: 'Discover how maple syrup is produced from tree to table.' },
    { title: 'Sustainable Lumber Practices', image: 'story2.jpg', description: 'Learn about eco-friendly lumber harvesting in Canada.' },
    { title: 'Organic Farming in the Prairies', image: 'story3.jpg', description: 'Explore how organic grains are grown sustainably.' },
    { title: 'Artisan Cheese Making', image: 'story4.jpg', description: 'See the process of crafting traditional Canadian cheeses.' },
    { title: 'Eco-Friendly Apparel', image: 'story5.jpg', description: 'Find out how Canadian brands are producing sustainable clothing.' }
  ];

  // Function to create and append medal cards
  function loadMedals() {
    const medalsContainer = document.querySelector('.medals-container');
    medals.forEach(medal => {
      const medalCard = document.createElement('div');
      medalCard.classList.add('medal-card');

      const medalImg = document.createElement('img');
      medalImg.src = medal.image;
      medalImg.alt = medal.name;

      const medalName = document.createElement('p');
      medalName.textContent = medal.name;

      medalCard.appendChild(medalImg);
      medalCard.appendChild(medalName);
      medalsContainer.appendChild(medalCard);
    });
  }

  // Function to create and append story cards
  function loadStories() {
    const storiesContainer = document.querySelector('.stories-container');
    stories.forEach(story => {
      const storyCard = document.createElement('div');
      storyCard.classList.add('story-card');

      const storyImg = document.createElement('img');
      storyImg.src = story.image;
      storyImg.alt = story.title;

      const storyTitle = document.createElement('h3');
      storyTitle.textContent = story.title;

      const storyDesc = document.createElement('p');
      storyDesc.textContent = story.description;

      storyCard.appendChild(storyImg);
      storyCard.appendChild(storyTitle);
      storyCard.appendChild(storyDesc);
      storiesContainer.appendChild(storyCard);
    });
  }

  // Example impact data
  const baseCarbon = parseFloat((Math.random() * (8 - 5) + 5).toFixed(2)); // metric tons monthly
  const baseJobs = Math.floor(Math.random() * (100 - 50 + 1)) + 50;

  // Function to update impact statistics
  function updateImpactStats(period = 'monthly') {
    let multiplier = 1;
    if (period === 'weekly') multiplier = 1 / 4;
    else if (period === 'yearly') multiplier = 12;

    const carbon = (baseCarbon * multiplier).toFixed(2);
    const jobs = Math.round(baseJobs * multiplier);

    document.getElementById('carbon-saved').textContent = `${carbon} metric tons CO₂`;
    document.getElementById('jobs-supported').textContent = jobs;

    updateGraph(period); // Update chart
  }

  // Event listener for period selection
  document.getElementById('impact-period').addEventListener('change', (e) => {
    updateImpactStats(e.target.value);
  });

  // Function to update the graph using Highcharts
  function updateGraph(period) {
    const labels = period === 'weekly' ? ['Week 1', 'Week 2', 'Week 3', 'Week 4']
                  : period === 'yearly' ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
                  : ['Week 1', 'Week 2', 'Week 3', 'Week 4'];

    const data = labels.map(() => parseFloat((Math.random() * (baseCarbon * 1.5)).toFixed(2)));

    Highcharts.chart('impactChart', {
      chart: {
        type: 'line'
      },
      title: {
        text: 'CO₂ Savings Over Time'
      },
      xAxis: {
        categories: labels
      },
      yAxis: {
        title: {
          text: 'CO₂ Saved (metric tons)'
        }
      },
      series: [{
        name: 'CO₂ Saved',
        data: data,
        color: '#FF8181'
      }]
    });
  }

  // Initialize dashboard
  function initDashboard() {
    loadMedals();
    loadStories();
    updateImpactStats();
  }

  // Call the initialization function
  initDashboard();
});
