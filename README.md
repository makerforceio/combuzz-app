# Combuzz
Travelling to an unfamiliar destination is often a stressful and daunting process, especially under time constraints or when exposed to adverse weather conditions. Currently, most navigation maps contain too much information, which may overload or confuse the user. Furthermore, it requires the user to check the map at every junction, which could be very troublesome if both of their hands are occupied. We want to create a GPS that is easy to use and navigates without using visual cues.

## What it does
Introducing **Combuzz**, a pedestrian GPS that turns your phone into a buzzing compass. 

With Combuzz, all you have to do is to key in your final destination, and leave your phone in your pocket. Combuzz will calculate the shortest walking path based on street map data. There are two features that help you navigate: the visual component and the mechanical component. 

The visual component consist of a compass arrow that points you in the right direction. We have chosen to exclude the map feature incorporated into the usual GPS interfaces, and instead, only an arrow will be shown. The minimalist design simplifies the user experience and minimizes confusion.

Alternatively, you can use the vibration feature - which is the highlight of Combuzz. Essentially, it helps you navigate by vibrating your phone when you are facing the wrong direction. This allows you to get to your destination without having to hold your phone. Combuzz saves you the hassle of checking your phone at every turn and is especially useful when your hands are preoccupied or even if you are just feeling lazy.

## How we built it

The app is built lightweight completely using HTML5 APIs without any frameworks, aiming to be as small and minimalist as possible. Device orientation is handled through the deviceorientation API, geolocation through the Geolocation API and the vibration through the Vibration API. Map and direction data is acquired from Google Maps APIs. The entire app is a PWA serviced by a Service Worker, and is able to be added easily to the homescreen.

## Challenges we ran into

The vibration scaling algorithm gave us some problems, along with geolocation demanding https which proved to be quite the hassle, requiring the use of a remote dev server.

## Accomplishments that we're proud of

The entire app is less than 100Kb, with about 90% being taken up by the size of the icon files. Furthermore, there is minimal amount of words in the app, with most meaning conveyed through iconography.

## What we learned

We learned minimalism. Also, as one may tell, do not leave this writeup to the last minute.

## What's next for Combuzz

Better path-following, rather than as-the-crow-flies projections.
