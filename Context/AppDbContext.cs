using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using System.Collections.Generic;
using System.Data;
using SystemAdmin.Models;

namespace SystemAdmin.Context
{
    public class AppDbContext : DbContext
    {
        private IDbContextTransaction _currentTransaction;
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseSqlServer("Server=DESKTOP-GN5VE70;Database=Global_Integration;TrustServerCertificate=True;Integrated Security=True;", options =>
            {
                options.CommandTimeout(300); // Timeout in seconds
            });
        }

        public DbSet<IntegrationEventLog>? IntegrationEventLogs { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Ensure the EventId is the primary key
            modelBuilder.Entity<IntegrationEventLog>()
                .HasKey(e => e.EventId);

            modelBuilder.Entity<IntegrationEventLog>()
            .Property(e => e.Content)
            .IsUnicode(false);
        }

        public IDbContextTransaction GetCurrentTransaction() => _currentTransaction;
        public bool HasActiveTransaction => _currentTransaction != null;
        public async Task<IDbContextTransaction> BeginTransactionAsync()
        {
            if (_currentTransaction != null) return null;

            _currentTransaction = await Database.BeginTransactionAsync(IsolationLevel.ReadCommitted);

            return _currentTransaction;
        }

        public async Task CommitTransactionAsync(IDbContextTransaction transaction)
        {
            if (transaction == null) throw new ArgumentNullException(nameof(transaction));
            if (transaction != _currentTransaction) throw new InvalidOperationException($"Transaction {transaction.TransactionId} is not current");

            try
            {
                await SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch
            {
                RollbackTransaction();
                throw;
            }
            finally
            {
                if (_currentTransaction != null)
                {
                    _currentTransaction.Dispose();
                    _currentTransaction = null;
                }
            }
        }

        public void RollbackTransaction()
        {
            try
            {
                _currentTransaction?.Rollback();
            }
            finally
            {
                if (_currentTransaction != null)
                {
                    _currentTransaction.Dispose();
                    _currentTransaction = null;
                }
            }
        }
    }
}
