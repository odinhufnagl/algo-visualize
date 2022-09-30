Write your own code inside the main functions and then run it to be able to see how it interacts with either the grid or graph. I would suggest you to try the algoritms I have already created to get a better understanding of how to use the project. These can be chosen in the dropdown next to the dropdown for language.

You are given functions as parameters which could be used to update the cells/nodes/edges with different states so that they change color.

You are also given how the grid/graph looks, so that you can check where there are walls and what the weights are. Though, remember that the graph/grid you are given in the parameters is a copy of the graph/grid and will not update when you update the graph/grid. So if you for example want to run a dijkstras and keep in store which nodes you have visited, you have to keep visited nodes in an array or dictionary for yourself. That also makes the coding flow more like how it often looks when you are creating a dijkstras. The only difference now is that when you are adding a node to your own "visited" list, you should also use a function from the parameters to update the node in the graphVisualizer.

The "add heightmap" accepts an image, preferably on a heightmap. What it does is it converts the image to grayscale, and then it will project the colorvalues as weights on the grid. Darker value means lower weight. This format suits heightmaps really good, because you could try your algoritms on a real life example of a mountain chain. In the repo there is an image you can test with.

Notice how you can speed up the functions if you want, because traversing the grid will sometimes appear pretty slow if there is a long distance
