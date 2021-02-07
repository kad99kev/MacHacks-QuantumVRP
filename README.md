<p><img src="https://challengepost-s3-challengepost.netdna-ssl.com/photos/production/challenge_photos/001/325/482/datas/full_width.jpg" height="200px" width="200px">
<img src="static/img/logo.png" height = "200px">
</p>
<br>

# MacHacks-QuantumVRP
Project Title: “Delivering Vaccines Using Qiskit and Vehicle Routing Problem”

## Inspiration
As we all currently know, COVID vaccines are being dispersed throughout the world at varying rates and times. As a general area of interest, we wanted to know if the solution to this could lie in quantum computing. Could Qiskit Aqua, given a certain number of trucks and stops, propose ideal routes for delivery in a realistic way? Furthermore, if it became a traveling drone problem instead of trucks, could the delivery be done more efficiently? Is it more cost efficient and time saving?

##What was the exact issue
A number of delivery vehicles (e.g. trucks and container ships) are operated by most service providers and most of these vehicles are based overnight, and serve a number of customer locations with each vehicle during each day. There are also challenges of optimization and control that take these criteria into account. Computationally, the main problem is how to build routes from depots to a variety of customer locations most efficiently without extra time or distance, as well as other resources, being spent.

##Solution to the problem
After going through a lot of optimisation problems we finally agreed to go ahead with the Vehicle Routing Problem (VRP). VRP is one of the most challenging combinatorial optimization tasks, a central problem in the areas of transportation, distribution and logistics. Decreasing transport costs can be achieved through better resources (vehicles) utilization. VRP is to design route for N vehicles with M depots and P customers in order to meet the given constraints (less time, less fuel, less trucks, less workers)

## What it does
Our API makes use of Mapbox to calculate distances and routes from one depot to drop-off locations. Using Qiskit Aqua, it gives a comparison of methods (the noisy QASM Simulator, the QASM Simulator with Matrix-State Method, the StateVector Simulator Method, the classical/binary solver, and quantum solver methods) for efficiency. 

##Overall Workflow



## How we built it
Qiskit Aqua has a number of useful tutorials as great starting points. The one we used most was: https://qiskit.org/documentation/tutorials/optimization/7_examples_vehicle_routing.html
We also used a number of resources online. We firstly tried to learn Qiskit in the allotted time given to us from Youtube and some online books. Thanks to ‘Qiskit’ Channel on youtube that helped us learn and explore more. (https://www.youtube.com/channel/UClBNq7mCMf5xm8baE_VMl3A) We also attended the IBM Workshops during the Hackathon, which also turned out to be interesting and helpful. For overall reference we used: https://qiskit.org/textbook/preface.html
Initially we were confused whether we should be going with TSP or VRP. Searching up, we found this great distinction between them. (https://www.researchgate.net/figure/Illustration-of-the-traveling-salesman-problem-TSP-and-vehicle-route-problem-VRP_fig1_277673931#:~:text=The%20difference%20between%20TSP%20and,vehicle%20capacity%20limitation.%20…)



## So could be solved using traditional TSP using Constraints ?

This problem has many similarities to a TSP, but simply adding constraints to a TSP won't be sufficient. For example, in the TSP, the (single) vehicle must visit each customer exactly once. In this problem, a decision needs to be made as to which vehicle will visit a particular customer.Additionally, this problem requires some coordination aspects that are absent from a TSP.



## Challenges we ran into
Understanding the concepts and math required to apply the Vehicle Routing Problem to our setting, as well as making sure that the frontend and backend were communicating properly.
When we were ready with the frontend part, we were facing issues of how the user could input the cities and then how the coordinates would be sent to the backend. Initially we thought of storing them as a .json file as it would make the whole process a lot easier. After this, the question was: once we had got the best routes, how would we get a response from the Qiskit program to the Flask program? Most importantly, we had some issues collaborating the backend and the front end parts. When we were trying to draw lines or arrows on Mapbox, we could only find mostly Android sources for it, so that was one task for us to convert it into the web development part.

## Accomplishments that we're proud of
We are proud of learning how to use Qiskit Aqua and understanding its versatility, as well as creating something with an easy interface for users to be able to access this service. We are so glad that we were able to learn so much in such a short span. We did not only continuously acquire knowledge but we also kept track of each other by having discord calls after an hour or so. We were having a healthy communication and everyone in the team was motivating and all were open to new ideas. We also learnt some frontend development and backend from our fellow teammates. Not only this, but we were also able to understand the math, algorithm and chose what the best solution was to each problem. We also developed our analytical thinking skills. We also learned of various libraries present and quantum computing for linear equations!


## What we learned
Classical adaptations of quantum methods are much slower than ideal classical solutions. Shocking.

## What's next for Delivering Vaccines Using Qiskit and Vehicle Routing Problem
For the next steps, the main concern would be adapting this code into more realistic settings. For example, could Mapbox tell it the best route knowing that there might be road blockages or bad weather ahead? 


