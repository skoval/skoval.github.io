library(dplyr)
library(oncourt)
library(data.table)
library(lme4)

height <- read.csv(file = "~/Data/Heights/extracted_info.csv", stringsAsFactors = F)
height <- height[,-1]
height <- height %>%
	rename(player = NAME_P, height = Height, weight = Weight) %>%
	dplyr::mutate(
		label = paste(height, "\n", weight, sep = "")
	)
	

data(atp_match_stats)
data(atp_tournaments)
data(atp_players)

atp_players <- atp_players %>%
	dplyr::mutate(BYEAR = year(DATE_P)) %>%
	select(NAME_P, ID_P, BYEAR)
	
atp_match_stats <- atp_match_stats %>%
	inner_join(atp_tournaments %>% select(NAME_T, ID_T, DATE_T), by = c("ID_T"))
		
atp_match_stats <- atp_match_stats %>%
	filter(!is.na(NA_1))	
	
atp_match_stats <- as.data.table(atp_match_stats)

atp_match_stats <- atp_match_stats[!grepl("Davis|juniors", NAME_T)]
atp_match_stats <- atp_match_stats[,year := year(DATE_T)]

	
match_stats <- 
	rbind(
		atp_match_stats[, .(year, ID_P = ID1, ID_T, NAME_T, ID_R, aces = ACES_1, serves = W1SOF_1, approaches = NAOF_1, points = (W1SOF_1 + W1SOF_2), returns = RPW_1, return_points = RPWOF_1)][, winner := TRUE],
		atp_match_stats[, .(year, ID_P = ID2, ID_T, NAME_T, ID_R, aces = ACES_2, serves = W1SOF_2, approaches = NAOF_2, points = (W1SOF_1 + W1SOF_2), returns = RPW_2, return_points = RPWOF_2)][, winner := FALSE]
	)	
	
match_stats <- match_stats[grepl("U.S.|Australian|French|Wimbledon|Olympics", NAME_T),]
match_stats <- match_stats[!is.na(points) & points > 60 & !(ID_R %in% c("Q1", "Q2", "Q3")) & year != 2016]	

match_stats <- match_stats %>%
	inner_join(atp_players, by = "ID_P") %>%
	dplyr::mutate(
		age = year - BYEAR,
		rate = approaches / points,
	) %>%
	filter(year >= 2005, NAME_T != "Olympics - London")
	
match_stats <- match_stats %>%
	left_join(height %>% select(NAME_P = player, height_cms), by = "NAME_P")	
	
	
match_stats$height_cms[match_stats$NAME_P == "Jannik Sinner"]	<- 188
match_stats$height_cms[match_stats$NAME_P == "Hugo Gaston"]	<- 173
match_stats$height_cms[match_stats$NAME_P == "Maxime Cressy" ]	<- 201 
match_stats$height_cms[match_stats$NAME_P == "David Sherwood" ]	<- 193
match_stats$height_cms[match_stats$NAME_P == "Laurent Recouderc" ]	<- 178
match_stats$height_cms[match_stats$NAME_P == "Chris Eaton" ]	<- 188
match_stats$height_cms[match_stats$NAME_P == "Thomas Schoorel" ]	<- 202
match_stats$height_cms[match_stats$NAME_P == "Axel Michon" ]	<- 176
match_stats$height_cms[match_stats$NAME_P == "Brandon Nakashima" ]	<- 185
match_stats$height_cms[match_stats$NAME_P == "Jeff Wolf" ]	<- 183
match_stats$height_cms[match_stats$NAME_P == "Jesse Huta Galung" ]	<- 188
match_stats$height_cms[match_stats$NAME_P == "Dawid Olejniczak" ]	<- 191
match_stats$height_cms[match_stats$NAME_P == "Luka Gregorc" ]	<- 190
match_stats$height_cms[match_stats$NAME_P == "Javier Marti" ]	<- 185
match_stats$height_cms[match_stats$NAME_P == "Augustin Gensse" ]	<- 180
match_stats$height_cms[match_stats$NAME_P == "Laurent Lokoli" ]	<- 188
match_stats$height_cms[match_stats$NAME_P == "Rudolf Molleker" ]	<- 185
match_stats$height_cms[match_stats$NAME_P == "Paul Jubb" ]	<- 183
match_stats$height_cms[match_stats$NAME_P == "Zachary Svajda" ]	<- 175
match_stats$height_cms[match_stats$NAME_P == "Tomas Machac" ]	<- 183
match_stats$height_cms[match_stats$NAME_P == "Emilio Gomez" ]	<- 185
match_stats$height_cms[match_stats$NAME_P == "Harold Mayot" ]	<- 178

match_stats <- match_stats %>%
	group_by(ID_P) %>%
	dplyr::mutate(
		acerate = sum(aces, na.rm = T) / sum(serves[!is.na(aces)], na.rm = T),
		rpw = sum(returns, na.rm = T) / sum(return_points[!is.na(returns)], na.rm = T)
	)

characteristics <- match_stats %>%
	select(ID_P, acerate, rpw, height_cms) %>%
	unique() %>%
	ungroup() %>%
	dplyr::mutate(
		z_acerate = as.numeric(scale(acerate)),
		z_rpw = as.numeric(scale(rpw)),
		z_height = as.numeric(scale(height_cms))
	) %>%
	select(-acerate, -rpw, -height_cms)
	
scales <- 	match_stats %>%
	ungroup() %>%
	select(acerate, rpw, height_cms) %>%
	gather("stat", "value", acerate, rpw, height_cms) %>%
	group_by(stat) %>%
	dplyr::summarise_all(
		.funs = list(mean, sd)
	)
	

match_stats <- match_stats %>%
	filter(!is.na(height_cms), !is.na(acerate), !is.na(points), !is.na(approaches))	


match_stats <- match_stats %>%
	inner_join(characteristics, by = "ID_P")
	
match_stats <- match_stats %>%
	dplyr::mutate(
		approach = log(rate + 1)
	)	
	

png(file = "~/Software/sports-blog/R/panels_approach.png", res = 180, width = 480 * 2, height = 480 * 2)

psych::pairs.panels(
	match_stats[match_stats$year <= 2015, c("acerate", "rpw", "height_cms", "rate")],
	hist.col = "#3bbb75",
	label = c("Ace Rate", "RPW", "Height (cm)", "Approach Rate"),
	main = "Grand Slams Men's Singles 2005 - 2015"
	) 
		
dev.off()		

fit <- bam(
	approaches ~ s(z_acerate, z_rpw, z_height) + NAME_T + offset(log(points)), 
	data = match_stats %>% filter(year <= 2015),
	family = poisson
)		



round_half <- function(x) round(x / 0.5, 0) * 0.5

freq <- characteristics %>%
	dplyr::mutate_at(
		vars(z_acerate, z_rpw, z_height),
		list(round_half)
	)
	
freq <- freq %>%
	filter(!is.na(z_acerate), !is.na(z_rpw), !is.na(z_height)) %>%
	group_by(z_acerate, z_rpw, z_height) %>%
	dplyr::summarise(
		n = n()
	 ) %>%
	 ungroup() %>%
	 dplyr::mutate(
	 	freq = n / sum(n),
	 	points = 1
	 	)	
	 	
freq <- do.call("rbind", lapply(unique(match_stats$NAME_T), function(x){
	freq$NAME_T <- x
freq
})	 	 
)
	 	
	 			
freq$p <- exp(predict(fit, newdata = freq))

freq <- freq %>%
	group_by(z_acerate, z_rpw, z_height) %>%
	dplyr::summarise(
		p = mean(p)
	)
	
freq$acerate <- freq$z_acerate * scales$fn2[scales$stat == "acerate"] + scales$fn1[scales$stat == "acerate"]	

freq$rpw <- freq$z_rpw  * scales$fn2[scales$stat == "rpw"] + scales$fn1[scales$stat == "rpw"]

freq$height <- floor(freq$z_height  * scales$fn2[scales$stat == "height_cms"] + scales$fn1[scales$stat == "height_cms"])

	
freq %>%
	filter(z_height < 4) %>%
	ggplot(aes(y = acerate, x = rpw))	+
	#geom_text(data = predictions %>% filter(obs), aes(label = round(p * 200, 0)), size = 2, col = "grey") +
	geom_hline(yintercept = scales$fn1[scales$stat == "acerate"], col = "darkgrey", size = 1.5) + 
	geom_vline(xintercept = scales$fn1[scales$stat == "rpw"], col = "darkgrey", size = 1.5) + 	
	geom_tile(aes(fill = p), col = "grey") +	
	facet_wrap(~height) + 
	scale_y_continuous("ace rate", n.breaks = 6) +
	scale_x_continuous("rpw", n.breaks = 6) +
	scale_fill_gradient("Approch Rate", low = "white", high = "#3bbb75") + 
	theme_hc() + 
	theme(legend.position = "bottom", legend.key.width = unit(0.1, "npc"), axis.text.x = element_text(size = 9, angle = 30, hjust = 0.5, vjust = 0.5)) + 
	ggtitle("Expected Approach Rate by Height (cm), Ace Rate, and RPW")
	
ggsave(file = "~/Software/sports-blog/R/approach_rate_heatmap.png", dpi = 300, width = 7, height = 6)	
	
### Recent residuals
predictions <- match_stats[match_stats$year > 2015,]

predictions$points <- 1

predictions$pred <- exp(predict(fit, newdata = predictions))

predictions$resid <- predictions$rate - predictions$pred

predictions %>%
	dplyr::mutate(
		age = ifelse(age <= 23, "23 and under", "Over 23")
	) %>%
	ggplot(aes(y = resid, x = factor(year), col = age, fill = age)) +	
	geom_hline(yintercept = 0, col = "red", size = 1, alpha = 0.5) +	
	geom_boxplot(outlier.shape = "", size = 1) + 
	geom_point(position = position_jitter(width = 0.3), alpha = 0.1) + 
	scale_colour_manual("", values = c("#e78e0c", "#3bbb75")) + 
	scale_fill_manual("", values = alpha(c("#e78e0c", "#3bbb75"), 0.1)) + 
	facet_wrap(~ sub(" -.*", "", NAME_T)) +
	theme_hc() +
	scale_y_continuous("Approach Rate Minus Expected") + 
	scale_x_discrete("Year") + 
	theme(legend.position = "top")
	
ggsave(file = "~/Software/sports-blog/R/approach_rate_trends.png", dpi = 300, width = 7, height = 6)		

surprises <- predictions %>%
	filter(year == 2020, resid > 0) %>%
	arrange(-resid)
	
	
surprises <- surprises[1:30,]	%>%
	dplyr::mutate(
		label = paste(NAME_P, glue("({age})"), sub(" - .*", "", NAME_T), ID_R)
	) %>%
	arrange(-resid)
	
surprises$label <- factor(surprises$label, level = surprises$label, order = T)	
	

surprises %>%
	gather("stat", "value", rate, resid) %>%
	dplyr::mutate(
		stat = ifelse(stat == "rate", "Approach Rate", "Rate Minus Expected")
	) %>%
	ggplot(aes(y = label, x = value, col = stat)) + 
	geom_point(size = 4) +
	theme_hc() + 
	facet_grid(. ~ stat) + 
	scale_colour_manual("", values = c("#e78e0c", "#3bbb75")) +
	scale_y_discrete("") + 
	scale_x_continuous("") +
	theme(text = element_text(size = 14)) + 
	ggtitle("Top 30 Surprising Approach Rates", sub = "Grand Slams 2020")
	
	
ggsave(file = "~/Software/sports-blog/R/approach_rate_surprises.png", dpi = 300, width = 8, height = 9)		
	