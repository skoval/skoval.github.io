library(ggplot2)
library(dplyr)
library(mvnfast)
library(data.table)
library(glue)

setwd("~/Software/d3-charts/return-impact")

load("~/Projects/ReturnImpact/stan_models/returners.RData")

model <- readRDS("~/Projects/ReturnImpact/stan_models/second_serve.rds")

format_model <- function(model){
	
	alpha <- model$draws("alpha")
	alphar <- model$draws("alpha_r")
	alphas <- model$draws("alpha_s")
	omega <- model$draws("Omega")
	omegas <- model$draws("Omega_s")
	omegar <- model$draws("Omega_r")
	sigma <- model$draws("Sigma_scale")
	sigmas <- model$draws("Sigma_scale_s")
	sigmar <- model$draws("Sigma_scale_r")
	theta <- model$draws("pbeta")
	lambda <- model$draws("lambda")

    D <- 2
    P <- 8
	M <- ncol(omega) / D^2
	K <- ncol(alpha) / (D * P)
	N <- 1000
	NR <- ncol(alphar) / (M * D * P)
	NS <- ncol(alphas) / (D * P)
	
	alpha <- array(alpha, c(N, M, D, P))
	alphas <- array(alphas, c(N, NS, D, P))
	alphar <- array(alphar, c(N, M, NR, D, P))
	
	omega <- array(omega, c(N, M, D, D))
	sigma <- array(sigma, c(N, M, D))
	theta <- array(theta, c(N, K, M))
	lambda <- array(lambda, c(N, NR, K))

list(alpha = alpha, alphas = alphas, alphar = alphar, omega = omega, sigma = sigma, theta = theta, lambda = lambda)
}


posterior <- format_model(model)

variance <- function(sigma, omega){
	diag(sigma) %*% t(omega) %*% omega %*% diag(sigma)
}

posterior_variance <- lapply(1:1000, function(i){
	lapply(1:6, function(j){
		variance(posterior$sigma[i,j,], posterior$omega[i,j,,])
	})
})


predictive_posterior <- function(x, n, surface, r, posterior, variance){
	
	# c(1,0,0,0,0,0)
	if(surface == "Hard")
		x <- c(x, 0, 0)
	else if(surface == "Clay")
		x <- c(x, 1, 0)
	else
		x <- c(x, 0, 1)
		
	index <- sample(1000, replace = T, size = n)
				
	results <- do.call("rbind", lapply(index, function(i){
			s <- sample(1:6, size = 1, prob = posterior$lambda[i,r,])
			k <- sample(1:6, size = 1, prob = posterior$theta[i,s,]) # Draw based on style weights
			as.numeric(mvnfast::rmvn(n = 1, mu = (posterior$alpha[i,k,,] +posterior$alphar[i,k,r,,]) %*% x, sigma = variance[[i]][[k]]))
		}))		
	
	results <- as.data.table(results)
	setnames(results, names(results), c("X", "Y"))
	
results
}


returners <- returners[order(returners$return_id),]
returners$player <- toupper(returners$player)
jsonlite::write_json(returners, path = "data/players.json")

serve <- 1

# 1stserve prop c(0.45, 0.1, 0.45)
# 2ndserve prop c(0.3, 0.4, 0.3)

for(i in returners$return_id){

predictions <- rbind(
	predictive_posterior(c(1,0,0,0,0,0), n = 900, surface = "Hard", r = i, posterior, posterior_variance) %>% dplyr::mutate(type = "T"),
	predictive_posterior(c(1,1,0,0,0,0), n = 200, surface = "Hard", r = i, posterior, posterior_variance) %>% dplyr::mutate(type = "Body"),	
	predictive_posterior(c(1,0,1,0,0,0), n = 900, surface = "Hard", r = i, posterior, posterior_variance) %>% dplyr::mutate(type = "Wide")
)

jsonlite::write_json(predictions, path = glue("data/player_r{i}_ad_s{serve}_hard.json"))


predictions <- rbind(
	predictive_posterior(c(1,0,0,0,0,0), n = 900, surface = "Clay", r = i, posterior, posterior_variance) %>% dplyr::mutate(type = "T"),
	predictive_posterior(c(1,1,0,0,0,0), n= 200, surface = "Clay", r = i, posterior, posterior_variance) %>% dplyr::mutate(type = "Body"),	
	predictive_posterior(c(1,0,1,0,0,0), n = 900, surface = "Clay", r = i, posterior, posterior_variance) %>% dplyr::mutate(type = "Wide")
)

jsonlite::write_json(predictions, path = glue("data/player_r{i}_ad_s{serve}_clay.json"))


predictions <- rbind(
	predictive_posterior(c(1,0,0,0,0,0), n = 900, surface = "Grass", r = i, posterior, posterior_variance) %>% dplyr::mutate(type = "T"),
	predictive_posterior(c(1,1,0,0,0,0), n = 200, surface = "Grass", r = i, posterior, posterior_variance) %>% dplyr::mutate(type = "Body"),	
	predictive_posterior(c(1,0,1,0,0,0), n = 900, surface = "Grass", r = i, posterior, posterior_variance) %>% dplyr::mutate(type = "Wide")
)

jsonlite::write_json(predictions, path = glue("data/player_r{i}_ad_s{serve}_grass.json"))


predictions <- rbind(
	predictive_posterior(c(1,0,0,1,0,0), n = 900, surface = "Hard", r = i, posterior, posterior_variance) %>% dplyr::mutate(type = "T"),
	predictive_posterior(c(1,0,0,0,1,0), n = 200, surface = "Hard", r = i, posterior, posterior_variance) %>% dplyr::mutate(type = "Body"),	
	predictive_posterior(c(1,0,0,0,0,1), n = 900, surface = "Hard", r = i, posterior, posterior_variance) %>% dplyr::mutate(type = "Wide")
)

predictions$Y <- -1 * predictions$Y

jsonlite::write_json(predictions, path = glue("data/player_r{i}_deuce_s{serve}_hard.json"))


predictions <- rbind(
	predictive_posterior(c(1,0,0,1,0,0), n = 900, surface = "Clay", r = i, posterior, posterior_variance) %>% dplyr::mutate(type = "T"),
	predictive_posterior(c(1,0,0,0,1,0), n = 200, surface = "Clay", r = i, posterior, posterior_variance) %>% dplyr::mutate(type = "Body"),	
	predictive_posterior(c(1,0,0,0,0,1), n = 900, surface = "Clay", r = i, posterior, posterior_variance) %>% dplyr::mutate(type = "Wide")
)

predictions$Y <- -1 * predictions$Y

jsonlite::write_json(predictions, path = glue("data/player_r{i}_deuce_s{serve}_clay.json"))


predictions <- rbind(
	predictive_posterior(c(1,0,0,1,0,0), n = 900, surface = "Grass", r = i, posterior, posterior_variance) %>% dplyr::mutate(type = "T"),
	predictive_posterior(c(1,0,0,0,1,0), n = 200, surface = "Grass", r = i, posterior, posterior_variance) %>% dplyr::mutate(type = "Body"),	
	predictive_posterior(c(1,0,0,0,0,1), n = 900, surface = "Grass", r = i, posterior, posterior_variance) %>% dplyr::mutate(type = "Wide")
)

predictions$Y <- -1 * predictions$Y

jsonlite::write_json(predictions, path = glue("data/player_r{i}_deuce_s{serve}_grass.json"))

}

serve <- 2

for(i in returners$return_id){

predictions <- rbind(
	predictive_posterior(c(1,0,0,0,0,0), n = 600, surface = "Hard", r = i, posterior, posterior_variance) %>% dplyr::mutate(type = "T"),
	predictive_posterior(c(1,1,0,0,0,0), n = 800, surface = "Hard", r = i, posterior, posterior_variance) %>% dplyr::mutate(type = "Body"),	
	predictive_posterior(c(1,0,1,0,0,0), n = 600, surface = "Hard", r = i, posterior, posterior_variance) %>% dplyr::mutate(type = "Wide")
)

jsonlite::write_json(predictions, path = glue("data/player_r{i}_ad_s{serve}_hard.json"))


predictions <- rbind(
	predictive_posterior(c(1,0,0,0,0,0), n = 600, surface = "Clay", r = i, posterior, posterior_variance) %>% dplyr::mutate(type = "T"),
	predictive_posterior(c(1,1,0,0,0,0), n= 800, surface = "Clay", r = i, posterior, posterior_variance) %>% dplyr::mutate(type = "Body"),	
	predictive_posterior(c(1,0,1,0,0,0), n = 600, surface = "Clay", r = i, posterior, posterior_variance) %>% dplyr::mutate(type = "Wide")
)

jsonlite::write_json(predictions, path = glue("data/player_r{i}_ad_s{serve}_clay.json"))


predictions <- rbind(
	predictive_posterior(c(1,0,0,0,0,0), n = 600, surface = "Grass", r = i, posterior, posterior_variance) %>% dplyr::mutate(type = "T"),
	predictive_posterior(c(1,1,0,0,0,0), n = 800, surface = "Grass", r = i, posterior, posterior_variance) %>% dplyr::mutate(type = "Body"),	
	predictive_posterior(c(1,0,1,0,0,0), n = 600, surface = "Grass", r = i, posterior, posterior_variance) %>% dplyr::mutate(type = "Wide")
)

jsonlite::write_json(predictions, path = glue("data/player_r{i}_ad_s{serve}_grass.json"))


predictions <- rbind(
	predictive_posterior(c(1,0,0,1,0,0), n = 600, surface = "Hard", r = i, posterior, posterior_variance) %>% dplyr::mutate(type = "T"),
	predictive_posterior(c(1,0,0,0,1,0), n = 800, surface = "Hard", r = i, posterior, posterior_variance) %>% dplyr::mutate(type = "Body"),	
	predictive_posterior(c(1,0,0,0,0,1), n = 600, surface = "Hard", r = i, posterior, posterior_variance) %>% dplyr::mutate(type = "Wide")
)

predictions$Y <- -1 * predictions$Y

jsonlite::write_json(predictions, path = glue("data/player_r{i}_deuce_s{serve}_hard.json"))


predictions <- rbind(
	predictive_posterior(c(1,0,0,1,0,0), n = 600, surface = "Clay", r = i, posterior, posterior_variance) %>% dplyr::mutate(type = "T"),
	predictive_posterior(c(1,0,0,0,1,0), n = 800, surface = "Clay", r = i, posterior, posterior_variance) %>% dplyr::mutate(type = "Body"),	
	predictive_posterior(c(1,0,0,0,0,1), n = 600, surface = "Clay", r = i, posterior, posterior_variance) %>% dplyr::mutate(type = "Wide")
)

predictions$Y <- -1 * predictions$Y

jsonlite::write_json(predictions, path = glue("data/player_r{i}_deuce_s{serve}_clay.json"))


predictions <- rbind(
	predictive_posterior(c(1,0,0,1,0,0), n = 600, surface = "Grass", r = i, posterior, posterior_variance) %>% dplyr::mutate(type = "T"),
	predictive_posterior(c(1,0,0,0,1,0), n = 800, surface = "Grass", r = i, posterior, posterior_variance) %>% dplyr::mutate(type = "Body"),	
	predictive_posterior(c(1,0,0,0,0,1), n = 600, surface = "Grass", r = i, posterior, posterior_variance) %>% dplyr::mutate(type = "Wide")
)

predictions$Y <- -1 * predictions$Y

jsonlite::write_json(predictions, path = glue("data/player_r{i}_deuce_s{serve}_grass.json"))

}

