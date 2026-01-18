# Pokémon Tier List Flask Web App

#### Video Demo: https://youtu.be/HxK0rosVuso

#### Description:

This project is a Flask-based web application that allows users to rank each generation of Pokémon using a tier list system.  Users can view Pokémon, assign them star ratings from one to five, and see those rankings reflected dynamically on the page. The application blends backend logic written in Python with a frontend built using HTML, CSS, and JavaScript to create an interactive and visually clear experience.

The inspiration for this project comes from classic tier-list culture commonly found in gaming communities. Pokémon, being a franchise with decades of history, naturally lends itself to ranking and debate. This project captures that spirit while demonstrating full-stack web development concepts such as routing, templating, state handling, and user interaction.

At a high level, the application displays Pokémon grouped into rows based on their star rating. A sidebar shows the currently selected Pokémon along with controls that allow the user to assign a rating. When a rating is selected, the Pokémon is moved into the corresponding tier row. This gives immediate visual feedback and makes the ranking process intuitive and engaging. The user can also move the Pokemon between rows or inside of their respective rows for more exact ranking after they have already been placed. 

---

### File Structure and Responsibilities

The core of the application is handled by Flask.

- **`app.py`**  
  This file contains the main Flask application. It defines the routes, handles requests, and passes Pokémon data to the templates. It is responsible for initializing the app, loading Pokémon data, and managing updates to rankings. Any server-side logic lives here, including preparing data structures that the frontend consumes.

- **`templates/`**  
  This folder contains the HTML templates rendered by Flask. The primary template displays the tier list layout, navigation bar, and Pokémon detail panel. Jinja templating is used to dynamically generate Pokémon entries and tier rows based on data passed from the backend.

- **`static/`**  
  This directory contains all static assets such as CSS, JavaScript, and images.  
  - The **CSS** file controls the layout, spacing, and visual hierarchy of the tier list, ensuring each tier is clearly separated and visually readable.  
  - The **JavaScript** file manages client-side interactions, including selecting Pokémon, assigning star ratings, and updating the UI without requiring a full page reload.  
  - Pokémon sprite images are also stored here to ensure fast loading and consistent presentation.

- **Pokemon.db**  
  Pokémon information such as names, IDs, generations, and current rankings are stored in a sqlite database. This allows the app to scale easily and keeps the logic separated from raw data.

---

### Design Choices and Tradeoffs

One major design decision was separating frontend interactivity from backend logic. Flask handles routing and data preparation, while JavaScript is responsible for user interaction and immediate UI updates. This keeps the application responsive and avoids unnecessary server requests for simple actions like selecting a Pokémon or changing its tier.

Another decision was to use a star-based tier system rather than letter tiers (S, A, B, etc.). Stars are more universally intuitive and visually clear, especially for users unfamiliar with competitive ranking systems. The five-star model also maps cleanly to UI rows and makes sorting straightforward.

The layout intentionally mirrors traditional tier lists: highest-ranked Pokémon appear at the top, with weaker or less-favored Pokémon placed lower. This aligns with user expectations and minimizes the learning curve. Simplicity was prioritized over flashy animations to keep the focus on usability and clarity.

A navbar is included on top which leads to each different generation and each separate tier list. When you leave a tier list and come back to it your rankings are saved to the browser and will stay that way until you press the reset button which will set the ranking back to the start. 

---

### What This Project Demonstrates

This project showcases the use of Flask to build a dynamic web application, proper separation of concerns between backend and frontend, and thoughtful UI design. It demonstrates routing, templating, static file management, and interactive client-side behavior. It also reflects an understanding of how users interact with ranking systems and how to present information clearly.

Most importantly, this project represents a complete, functional application rather than a simple demo. It was built with care, tested through use, and designed to be extended. Like Pokémon itself, it respects the classics while leaving room to grow.

---

