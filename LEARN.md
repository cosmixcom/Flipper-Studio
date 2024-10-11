# How I Made This

I wanted to design some payloads for my Flipper Zero so I could learn more about the language and how it worked. But I realized I had to code it in a text editor with no syntax highlighting and that it would be super complicated. This was a pain so I decided to make my own IDE.

## Designing the UI

I designed the UI using basic HTML and CSS I got inspiration for it from bridge-core/editor.

## IDE & Syntax Highlighting

I created a simple array with all the keywords and setup a basic script to change the colors and fonts based on them.

## Importing Scripts

I made it so that you can import scripts from URLs using fetch, and a file API using the built in browser API.

## Serial Connections

Another issue I found with programming payloads was actually booting them onto the device. So I investigated and found out that Flipper Zero has an api which can be accessed over serial port. So I made it emulate a CLI command and write files directly to the payloads folder.

# How you can modify

Feel free to fork the project and create issues or pull requests with any cool new ideas. I really want feedback aswell. PS. This project was designed for educational purposes please don't create anything bad with this...

I'm sure my code is impossible to understand and decifer my code but you can still try. Contact me for any additional information.

# Other projects

If you like this project I have also worked on other sites such as https://zymono.com which is a lot more advanced.
