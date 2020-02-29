library(ggplot2)
library(ggthemes)
library(dplyr)
library(jsonlite)

height <- read.csv(file = "~/Downloads/extracted_info.csv", stringsAsFactors = F)
height <- height[,-1]
height <- height %>%
	rename(player = NAME_P, height = Height, weight = Weight) %>%
	dplyr::mutate(
		label = paste(height, "\n", weight, sep = "")
	)
	
	
top100 <- read_html("https://www.atptour.com/en/rankings/singles") %>% 
	html_nodes("table") %>% 
	html_table()

top100 <- top100[[1]]$Player

top100[top100 == "Diego Schwartzman"] <- "Diego Sebastian Schwartzman"
top100[top100 == "Felix Auger-Aliassime"] <- "Felix Auger Aliassime"
top100[top100 == "Cristian Garin"] <- "Christian Garin"
top100[top100 == "Alex de Minaur"] <- "Alex De Minaur"
top100[top100 == "Pablo Carreno Busta"] <- "Pablo Carreno-Busta"
top100[top100 == "Taylor Fritz"] <- "Taylor Harry Fritz"
top100[top100 == "Ricardas Berankis" ] <- "Richard Berankis"
top100[top100 == "Ricardas Berankis" ] <- "Richard Berankis"
top100[top100 == "Soonwoo Kwon" ] <- "Soon-Woo Kwon"
top100[top100 == "Thiago Monteiro" ] <- "Thiago Moura Monteiro"

top100_2002 <- read_html("https://www.atptour.com/en/rankings/singles?rankDate=2000-02-21&rankRange=0-100") %>% 
	html_nodes("table") %>% 
	html_table()

top100_2002 <- top100_2002[[1]]$Player 	

top100_2002[top100_2002 == "Jacobo Diaz" ] <- "Jacobo Diaz-Ruiz"
top100_2002[top100_2002 == "David Sanchez" ] <- "David Sanchez-Munoz"
top100_2002[top100_2002 == "David Sanchez" ] <- "Vince Spadea"
top100_2002[top100_2002 == "Juan Antonio Marin"] <- "Juan-Antonio Marin"
top100_2002[top100_2002 == "Martin Damm" ] <- "Martin Damm (1972)"


height <- height %>%
	filter(player %in% c(top100, top100_2002)) %>%
	dplyr::mutate(
		group = ifelse(player %in% top100, "Current", "2000")
	)
	
ronaldo <- data.frame(
	player = "Cristiano Ronaldo",
	height = "6'2\" (188 cm)",
	weight = "184 lbs (83 kg)",
	weight_kgs = 83,	
	height_cms = 188,
	label = "6'2\" (188 cm)\n184 lbs (83 kg)",
	group = "Ronaldo",
	stringsAsFactors = F
)

height <- rbind(height, ronaldo)

writeLines(toJSON(height), con = "~/Software/sports-blog/static/js/atp_heights.json")